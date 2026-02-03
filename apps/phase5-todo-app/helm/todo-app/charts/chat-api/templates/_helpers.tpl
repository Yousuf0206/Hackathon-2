{{/*
Chat API chart helper templates.
*/}}

{{- define "chat-api.fullname" -}}
{{- printf "%s-chat-api" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "chat-api.name" -}}
chat-api
{{- end -}}

{{- define "chat-api.labels" -}}
app.kubernetes.io/name: {{ include "chat-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: chat-api
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "chat-api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "chat-api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: chat-api
{{- end -}}
