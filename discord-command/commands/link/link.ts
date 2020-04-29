import { IServerCommand, IEmbeddedMessage, ICommandResponse } from '..'
import { UniqueViolationError } from 'objection'
import DiscordLink from '../../../shared/models/DiscordLink'
import { getResolutionForName, authorizedTypes } from './'
import { ICommandRequest } from '../..'
import IllegalArgumentError from '../../../shared/errors/IllegalArgumentError'

const link: IServerCommand = {
    command: "link",
    minArgs: 2,
    usage: "!link <alliance|character|corporation> <name> [<@discord role>] [--raw]",
    perform: async (commandRequest: ICommandRequest): Promise<ICommandResponse> => {
        const guild = commandRequest.guild?.id
        if (!guild) {
            throw new IllegalArgumentError
        }
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

        if (!authorizedTypes.includes(linkType)) {
            return {
                reply: {
                    message: `${linkType} is not a valid type. Expected <alliance|character|corporation>`
                }
            }
        }

        const resolution = await getResolutionForName(linkType, linkName)
            .catch(err => { })
        if (!resolution) {
            return {
                reply: {
                    message: `${linkName} of type ${linkType} was not found.`
                }
            }
        }

        if (!mentionedRoleId) {
            return DiscordLink.query()
                .where('type', linkType)
                .where('type_id', resolution.id)
                .debug()
                .then(data => {
                    const links = data.map(link => link.role_id)
                    return {
                        reply: {
                            message: `Links: ${links.map(role_id => `${isRawRole ? '\\' : ''}<@&${role_id}>`).join(" ")}`
                        }
                    }
                })
        }

        return DiscordLink.query().insert({
            type: linkType,
            type_id: resolution.id,
            role_id: mentionedRoleId,
            guild
        }).then(data => {
            const embeddedMessage: IEmbeddedMessage = {
                title: "Success!",
                color: "#32CD32",
                thumbnail: resolution.logo,
                fields: [
                    { name: "Linked", value: `${linkType}: ${resolution.name} -> ${isRawRole ? '\\' : ''}<@&${mentionedRoleId}>` }
                ]
            }

            return {
                reply: {
                    message: `Successfully linked: ${data.type} - ${data.type_id}: - ${isRawRole ? '\\' : ''}<@&${data.role_id}>`,
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
            .catch((err): ICommandResponse => {
                if (err instanceof UniqueViolationError) {
                    return {
                        reply: {
                            message: "This link already exists"
                        }
                    }
                }
                throw (err)
            })
    }
}

export default link