import { sentenceCase } from "sentence-case"

document.addEventListener('datashare:ready', ({ detail }) => {

  // The project in which we'll add the plugin
  const project = detail.core.config.get('sentenceCaseProject', 'local-datashare')

  // Register the hook only for the given project
  detail.core.registerHookForProject(project, {
    name: 'sentence-case-toggler',
    target: 'document.content.ner:after',
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
            // True is the pipeline is activate
            return !!this.$store.getters['pipelines/getPipelineByName'](this.pipelineName)
          }
        }
      },
      methods: {
        registerPipeline () {
          this.$core.registerPipelineForProject(project, {
            name: this.pipelineName,
            category: 'extracted-text:pre',
            type: text => {
              return text.split(/\n|\r/g).map(sentenceCase).join('\n')
            }
          })
        },
        unregisterPipeline () {
          this.$core.unregisterPipeline(this.pipelineName)
        }
      },
      template: `<div class="document__content__sentence-case py-1 font-weight-bold mb-3">
        <b-form-checkbox v-model="toggler" switch>
          To Sentence Case
        </b-form-checkbox>
      </div>`
    }
  })
})
