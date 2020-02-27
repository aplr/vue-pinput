import parser from './grammar.pegjs'

const validatorMap = {
    hex: /^[0-9a-f]$/i,
    num: /^[0-9]$/,
    alpha: /^[0-9a-z]$/i,
    custom: /.*/
}

export function parseFormat(format) {
    return parser.parse(format)
}

export function convertFormat(length, field) {
    return Array.from({ length }, () => ({
        type: 'field',
        field
    }))
}

export function validateField(field, input) {
    return validatorMap[field].test(input)
}
