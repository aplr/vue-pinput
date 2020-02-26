<template>
    <div id="app" :class="$style.app">
        <div :class="$style.controlBar">
            <h5 class="m-0">
                <span class="text-muted">Vue </span>
                <span class="text-primary">Pin</span>
                <span class="text-muted"> In</span>
                <span class="text-primary">put</span>
            </h5>
            <b-form inline>
                <div :class="$style.controlGroup">
                    <label for="inputLength" class="mr-2 text-nowrap">
                        <span>Length ({{ length }})</span>
                    </label>
                    <b-form-input
                        type="range"
                        :min="1"
                        :max="16"
                        :step="1"
                        v-model="rawLength"
                        class="d-block"
                        id="inputLength"
                        :disabled="hasFormat"
                    />
                </div>
                <div :class="$style.controlGroup">
                    <label for="inputLength" class="mr-2">Type</label>
                    <b-form-select
                        v-model="type"
                        :options="types"
                        :disabled="hasFormat"
                        size="sm"
                    />
                </div>
                <div :class="$style.controlGroup">
                    <label for="inputFormat" class="mr-2">Format</label>
                    <b-form-input
                        v-model="format"
                        placeholder="Specify format..."
                        debounce="500"
                        class="d-block text-monospace"
                        id="inputFormat"
                        size="sm"
                        :state="formatValidation"
                    />
                    <a
                        href="https://github.com/aplr/vue-pinput"
                        target="_blank"
                        class="ml-2"
                    >
                        <Icon icon="info-circle"></Icon>
                    </a>
                </div>
            </b-form>
        </div>
        <div>
            <Pinput :length="length" :type="type" :format="format" />
        </div>
    </div>
</template>

<script>
import Pinput from './components/Pinput'
import { parseFormat } from './format'

export default {
    name: 'App',

    components: {
        Pinput
    },

    data: () => ({
        format: '',
        rawLength: 4,
        type: 'num',
        types: [
            { value: 'num', text: 'Numeric' },
            { value: 'hex', text: 'Hexadecimal' },
            { value: 'alpha', text: 'Alphanumeric' }
        ]
    }),

    created() {
        const query = new URLSearchParams(window.location.search)
        try {
            if (query.has('format')) {
                const format = decodeURIComponent(query.get('format'))
                parseFormat(format)
                this.format = format
            }
        } catch {
            this.addFormatToUrl()
        }
    },

    computed: {
        length() {
            return parseInt(this.rawLength, 10)
        },
        hasFormat() {
            return !!this.format
        },
        parsedFormat() {
            try {
                return parseFormat(this.format)
            } catch (e) {
                return []
            }
        },
        parseError() {
            try {
                parseFormat(this.format)
                return null
            } catch ({ message }) {
                return message
            }
        },
        formatValidation() {
            return this.hasFormat && this.parseError ? false : null
        }
    },

    methods: {
        addFormatToUrl(format) {
            const baseUrl = new URL(window.location.href.split('?')[0])
            const query = new URLSearchParams(window.location.search)
            if (this.hasFormat && format.length) {
                query.set('format', encodeURIComponent(this.format))
            } else {
                query.delete('format')
            }
            baseUrl.search = query.toString()
            window.history.replaceState({}, '', baseUrl.toString())
        }
    },

    watch: {
        parsedFormat(format) {
            this.addFormatToUrl(format)
        }
    }
}
</script>

<style lang="scss" module>
.app {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.controlBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 0 0 auto;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid black;
}

.controlGroup {
    display: flex;
    align-items: center;

    & + .controlGroup {
        margin-left: 1rem;
        padding-left: 1rem;
        border-left: 1px solid #eee;
    }
}
</style>
