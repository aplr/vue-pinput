<template>
    <div class="pinput">
        <div
            class="pinputBox"
            :class="field.type"
            :key="index"
            v-for="(field, index) in parsedFormat"
        >
            <input
                ref="input"
                :type="inputType"
                v-model="rawCode[index]"
                v-if="field.type === 'field'"
                @keydown="handleKeyDown(field, index, $event)"
                @paste="handlePaste"
            />
            <div v-if="field.type === 'divider'">{{ field.symbol }}</div>
        </div>
    </div>
</template>

<script>
import { parseFormat, convertFormat, validateField } from './format'

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
            validator: val => ['num', 'hex', 'alpha'].includes(val)
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
        },
        withDivider: {
            type: Boolean,
            required: false,
            default: true
        },
        secure: {
            type: Boolean,
            required: false,
            default: false
        },
        autofocus: {
            type: Boolean,
            required: false,
            default: false
        }
    },

    data: () => ({
        rawCode: []
    }),

    mounted() {
        this.$nextTick(() => {
            this.autofocus && this.$refs.input[0].focus()
        })
    },

    computed: {
        parsedFormat() {
            try {
                return parseFormat(this.format)
            } catch {
                return convertFormat(this.length, this.type)
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
        hydratedCode() {
            return this.parsedFormat.map((field, index) =>
                field.type === 'field' ? this.rawCode[index] : field.symbol
            )
        },
        codeLength() {
            return this.hasFormat ? this.fields.length : this.length
        },
        valid() {
            return this.parsedFormat.every((field, index) =>
                field.type === 'field'
                    ? validateField(field.field, this.rawCode[index])
                    : true
            )
        },
        inputType() {
            return this.secure ? 'password' : 'text'
        }
    },

    methods: {
        handleInput() {
            if (this.valid) {
                this.$emit(
                    'input',
                    (this.withDivider ? this.hydratedCode : this.code).join('')
                )
            } else {
                this.$emit('input', '')
            }
        },
        handleKeyDown({ field }, index, e) {
            const inputIndex = this.convertIndex(index),
                valid = validateField(field, e.key)

            if (e.metaKey || e.ctrlKey) {
                return
            }

            e.preventDefault()

            if (['Backspace', 'Delete'].includes(e.code)) {
                this.setCharacter(inputIndex, '')

                if (e.code === 'Backspace' && e.target.value.length === 0) {
                    this.handleNavigate(e.code, inputIndex)
                }

                return
            }

            if (['Tab', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                this.handleNavigate(e.code, inputIndex)
                return
            }

            if (valid) {
                this.setCharacter(inputIndex, e.key)
            }

            if (!(valid || ['Shift', 'Alt'].includes(e.key))) {
                this.shake()
            }

            if (valid && inputIndex < this.codeLength - 1) {
                this.$refs.input[inputIndex + 1].focus()
            }

            if (valid && inputIndex === this.codeLength - 1) {
                e.target.blur()
            }
        },
        handleNavigate(key, index) {
            if (
                ['Tab', 'ArrowRight'].includes(key) &&
                index < this.codeLength - 1
            ) {
                this.$refs.input[index + 1].focus()
            }

            if (['Tab'].includes(key) && index === this.codeLength - 1) {
                this.$refs.input[0].focus()
            }

            if (['ArrowLeft', 'Backspace'].includes(key) && index > 0) {
                this.$refs.input[index - 1].focus()
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
        },
        setCharacter(index, value) {
            this.rawCode.splice(index, 1, value)
        },
        reset() {
            this.rawCode = []
        },
        shake() {
            return new Promise(resolve => {
                this.$el.classList.add('animated', 'shake')

                const handleEnd = () => {
                    this.$el.classList.remove('animated', 'shake')
                    this.$el.removeEventListener('animationend', handleEnd)

                    resolve()
                }

                this.$el.addEventListener('animationend', handleEnd)
            })
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
        },
        rawCode() {
            this.handleInput()
        }
    }
}
</script>

<style lang="scss">
@import '~animate.css';

$primary: #0069ff;

.pinput {
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;

    animation-duration: 0.85s;
}

.pinputBox {
    flex: 0 0 auto;
    font-size: 32px;
    border-radius: 1rem;

    & + .pinputBox {
        margin-left: 1rem;
    }
}

.pinputBox.field {
    input {
        border: 4px solid #ddd;
        border-radius: 16px;
        outline: none !important;
        text-align: center;
        width: 68px;
        padding: 16px 8px;
        color: transparent;
        text-shadow: 0 0 0 #333;
        font-family: inherit;
        font-size: 100%;
        line-height: 1.15;
        margin: 0;
        overflow: visible;

        &:focus {
            border-color: $primary;
            outline: none;
        }
    }
}

.pinputBox.divider {
    text-align: center;
    align-items: center;
    justify-content: center;
    padding: 16px 8px;
    border: 4px solid transparent;
}
</style>
