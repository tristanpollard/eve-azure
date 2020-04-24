import esi from 'node-esi'
import Knex from 'knex'
import knexfile from '../knexfile'
import Token from './models/ESIToken'

const knex = Knex(knexfile)

// @ts-ignore
esi.defaults.model = Token
// @ts-ignore
esi.knex(knex)
