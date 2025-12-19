import DOMPurify from 'dompurify'
import tokenizer from 'sbd'

document.addEventListener('datashare:ready', ({ detail }) => {

  const stripHtml = str => {
     // Use DOMParser to safely parse HTML without executing scripts
     const parser = new DOMParser()
     const doc = parser.parseFromString(str, 'text/html')
     return doc.body.textContent || ""
  }

  const toSentenceCase = str => {
    // Sanitize input HTML to remove any malicious content
    const sanitizedStr = DOMPurify.sanitize(str)
    const sentences = tokenizer
      // Detect sentences using Sentence Boundary Detection (SBD)
      .sentences(sanitizedStr, { preserve_whitespace: false, newline_boundaries: true })
      .map(sentence => {
        const textContent = stripHtml(sentence)
        // Only if the string is all in uppercase
         if (textContent === textContent.toUpperCase()) {
           sentence = sentence.toLowerCase()
           sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1)
         }
         return sentence
      })

    return sentences.join('</p>')
  }

  // The project in which we'll add the plugin
  const project = detail.core.config.get('sentenceCaseProject', 'local-datashare')

  // Register the hook only for the given project
  detail.core.registerHookForProject(project, {
    name: 'sentence-case-toggler',
    target: 'document.content.body:before',
    order: -1,
    definition: {
      computed: {
        pipelineName () {
          return this.$config.get('sentenceCasePipelineName', 'extracted-text-sentence-case')
        },
        // This computed property will be used by as v-model of the toggler input
        toggler: {
          set (active) {
            return active ? this.registerPipeline() : this.unregisterPipeline()
          },
          get () {
            // Duck-typing to check if we use multiple stores (like in the new design)
            if (this.$core.stores) {
              const pipelinesStore = this.$core.stores.usePipelinesStore()
              return !!pipelinesStore.getPipelineByName(this.pipelineName)
            }
            return !!this.$store.getters['pipelines/getPipelineByName'](this.pipelineName)
          }
        }
      },
      methods: {
        registerPipeline () {
          this.$core.registerPipelineForProject(project, {
            name: this.pipelineName,
            category: 'extracted-text:post',
            type: toSentenceCase,
            order: 10
          })
        },
        unregisterPipeline () {
          this.$core.unregisterPipeline(this.pipelineName)
        }
      },
      template: `<div class="document__content__sentence-case alert alert-light border">
        <div class="form-check">
          <input type="checkbox" v-model="toggler" class="form-check-input" id="toggle-sentence-case" />
          <label class="form-check-label" for="toggle-sentence-case">Fix capitalization</label>
        </div>
      </div>`
    }
  })
})
