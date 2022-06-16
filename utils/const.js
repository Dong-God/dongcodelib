export default {
  MIME_type: {
    pdf: 'application/pdf',
    doc: 'application/msword',
    zip: 'application/zip',
    xlm: 'application/vnd.ms-excel',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    jpg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif,gif',
    jpeg: 'image/jpeg'
  },
  RULES: {
    RULES_REQUIRE: { required: true, message: '不能为空', trigger: 'blur' },
    RULES_ARRAY_REQUIRE: { type: 'array', required: true, message: '不能为空', trigger: 'blur' }
  },
  FORMAT: {
    DATE: 'yyyy-MM-dd',
    DATE_TIME: 'yyyy-MM-dd HH:mm:ss'
  },
  REGX: {
    host: /^http(s)?/
  }
}
