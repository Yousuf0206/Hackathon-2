{{/*
Notification Service chart helper templates.
*/}}

{{- define "notification.fullname" -}}
{{- printf "%s-notification" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "notification.name" -}}
notification
{{- end -}}

{{- define "notification.labels" -}}
app.kubernetes.io/name: {{ include "notification.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: notification
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "notification.selectorLabels" -}}
app.kubernetes.io/name: {{ include "notification.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: notification
{{- end -}}
