<template>
  <quillEditor :value="value" @input="$emit('input',$event)"/>
</template>
<script>
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import { quillEditor } from 'vue-quill-editor'

export default {
  name: 'sy-editor',
  props: {
    value: [String]
  },
  components: {
    quillEditor
  }
}
</script>
