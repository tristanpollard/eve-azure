import { IServerCommand, IEmbeddedMessage, ICommandResponse } from '..'
import { UniqueViolationError } from 'objection'
import DiscordLink from '../../../shared/models/DiscordLink'
import { getResolutionForName, authorizedTypes } from './'
import { ICommandRequest } from '../..'

const unlink: IServerCommand = {
    command: "unlink",
    minArgs: 3,
    usage: "!unlink <alliance|character|corporation> <name> <discord role> [--raw]",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        const commandArgs = commandRequest.args.split(" ")
        const isRawRole = commandRequest.flags?.includes('raw')
        const linkType = commandArgs.shift()
        const mentionedRole = commandRequest.mentions?.roles?.shift()
        let mentionedRoleId = mentionedRole?.id
        if (mentionedRole) {
            // remove the role as we grab it from first mention
            commandArgs.pop()
        } else if (commandArgs.length > 1 && isRawRole) {
            const lastArg = commandArgs[commandArgs.length - 1]
            // TODO: handle all numeric corporation name.
            if (lastArg.length && lastArg.match(/^[0-9]*$/)) {
                mentionedRoleId = commandArgs.pop()
            }
        }
        const linkName = commandArgs.join(" ")

        if (!mentionedRoleId) {
            return {
                reply: {
                    message: "Could not find role"
                }
            }
        }

        if (!authorizedTypes.includes(linkType)) {
            return {
                reply: {
                    message: `${linkType} is not a valid type. Expected <alliance|character|corporation>`
                }
            }
        }

        const resolution = await getResolutionForName(linkType, linkName)
            .catch(err => {})
        if (!resolution) {
            return {
                reply: {
                    message: `${linkName} of type ${linkType} was not found.`
                }
            }
        }

        return DiscordLink.query().deleteById([
            linkType,
            resolution.id,
            mentionedRoleId
        ]).then(data => {
            if (!data) {
                return {
                    reply: {
                        message: `Could not find link. ${linkType}: ${resolution.name} -> ${isRawRole ? '\\' : ''}<@&${mentionedRoleId}>`
                    }
                }
            }

            const embeddedMessage: IEmbeddedMessage = {
                title: "Success!",
                color: "#32CD32",
                thumbnail: resolution.logo,
                fields: [
                    { name: "Unlinked", value: `${linkType}: ${resolution.name} -> ${isRawRole ? '\\' : ''}<@&${mentionedRoleId}>` }
                ]

            }
            return {
                reply: {
                    message: `Successfully unlinked: ${linkType} - ${resolution.id}: - ${isRawRole ? '\\' : ''}<@&${mentionedRoleId}>`,
                    embed: embeddedMessage
                },
                serviceBusApiQueue: [
                    {
                        group: 'discord',
                        action: 'sync',
                        target: 'role',
                        guild: commandRequest.guild.id,
                        data: {
                            id: mentionedRoleId
                        }
                    }
                ]
            }
        })
    }
}

export default unlink