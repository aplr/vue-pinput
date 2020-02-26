<template>
    <div class="pinput">
        <div
            class="pinputBox"
            :class="field.type"
            :key="index"
            v-for="(field, index) in parsedFormat"
        >
            <input
                type="text"
                ref="input"
                v-if="field.type === 'field'"
                v-model="rawCode[index]"
                @keyup="handleKeyUp(field, index, $event)"
                @keydown="handleKeyDown(field, index, $event)"
                @paste="handlePaste"
            />
            <div v-if="field.type === 'divider'">{{ field.symbol }}</div>
        </div>
    </div>
</template>

<script>
import { parseFormat, convertFormat, validateField } from '../format'

export default {
    props: {
        /*
         * Code length (simple mode).
         */
        length: {
            type: Number,
            required: false,
            default: 4
        },
        /*
         * Field type (simple mode).
         * One of { 'num', 'hex', 'alpha' }
         */
        type: {
            type: String,
            required: false,
            default: 'alpha',
            validator: val => ~['num', 'hex', 'alpha'].indexOf(val)
        },
        /*
         * Pin code format. If specified, `length` and `mode` properties are ignored.
         * Format must be something like "(({%f}+)(%s)?)*{%f}", where
         *  %f: field type, one of { 'd', 'h', 'c' } (num, hex, alpha)
         *  %s: space, one of { '-', ' ' }
         */
        format: {
            type: String,
            required: false,
            default: null
        }
    },

    data: () => ({
        rawCode: []
    }),

    computed: {
        parsedFormat() {
            try {
                return this.format
                    ? parseFormat(this.format)
                    : convertFormat(this.length, this.mode)
            } catch {
                return []
            }
        },
        hasFormat() {
            return this.parsedFormat.length > 0
        },
        fields() {
            return this.parsedFormat
                .filter(({ type }) => type === 'field')
                .map(({ field }) => field)
        },
        code() {
            return this.rawCode.filter(char => !!char)
        },
        codeLength() {
            return this.hasFormat ? this.fields.length : this.length
        }
    },

    methods: {
        handleInput() {
            this.$emit('input', this.code.join())
        },
        handleKeyDown({ field }, index, e) {
            const inputIndex = this.convertIndex(index)
            e.target.setAttribute('data-prev', e.target.value)

            if (
                ~[
                    'Backspace',
                    'Delete',
                    'Tab',
                    'ArrowLeft',
                    'ArrowRight'
                ].indexOf(e.code) ||
                e.metaKey ||
                e.ctrlKey
            ) {
                return
            }

            if (!validateField(field, e.key)) {
                e.preventDefault()
                return
            }

            if (e.target.value.length > 0 && inputIndex < this.codeLength - 1) {
                this.$refs.input[inputIndex + 1].focus()
            } else if (e.target.value.length > 0) {
                e.preventDefault()
            }
        },
        handleKeyUp({ field }, index, e) {
            const inputIndex = this.convertIndex(index),
                previousValue = e.target.getAttribute('data-prev'),
                valid = validateField(field, e.key)

            if (valid && inputIndex === this.codeLength - 1) {
                e.target.blur()
                return
            }

            if (
                (~['Tab', 'ArrowRight'].indexOf(e.code) || valid) &&
                inputIndex < this.codeLength - 1
            ) {
                this.$refs.input[inputIndex + 1].focus()
            }

            if (~['ArrowLeft'].indexOf(e.code) && inputIndex > 0) {
                this.$refs.input[inputIndex - 1].focus()
            }

            if (
                ~['Backspace', 'Delete'].indexOf(e.code) &&
                previousValue.length == 0 &&
                inputIndex > 0
            ) {
                this.$refs.input[inputIndex - 1].focus()
                return
            }
        },
        handlePaste(e) {
            const chars = (event.clipboardData || window.clipboardData)
                .getData('text')
                .replace(/[^a-z0-9]/gi, '')
                .substring(0, this.codeLength)
                .split('')

            const valid =
                chars.length >= this.codeLength &&
                chars.every((char, index) =>
                    validateField(this.fields[index], char)
                )

            if (valid) {
                this.rawCode = this.parsedFormat.map(({ type }) =>
                    type === 'field' ? chars.shift() : undefined
                )
            }

            e.preventDefault()
            e.target.blur()
        },
        convertIndex(index) {
            return (
                index -
                this.parsedFormat
                    .slice(0, index)
                    .filter(({ type }) => type === 'divider').length
            )
        }
    },

    watch: {
        length() {
            this.reset()
        },
        type() {
            this.reset()
        },
        format() {
            this.reset()
        }
    }
}
</script>

<style lang="scss">
.pinput {
    display: flex;
    flex-wrap: nowrap;
}

.characterBox {
    flex: 0 0 auto;
    border-radius: 1rem;

    & + .characterBox {
        margin-left: 1rem;
    }
}
</style>
