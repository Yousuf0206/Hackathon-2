{{/*
WebSocket Service chart helper templates.
*/}}

{{- define "websocket.fullname" -}}
{{- printf "%s-websocket" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "websocket.name" -}}
websocket
{{- end -}}

{{- define "websocket.labels" -}}
app.kubernetes.io/name: {{ include "websocket.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: websocket
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "websocket.selectorLabels" -}}
app.kubernetes.io/name: {{ include "websocket.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: websocket
{{- end -}}
