{{/*
Recurring Task Service chart helper templates.
*/}}

{{- define "recurring-task.fullname" -}}
{{- printf "%s-recurring-task" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "recurring-task.name" -}}
recurring-task
{{- end -}}

{{- define "recurring-task.labels" -}}
app.kubernetes.io/name: {{ include "recurring-task.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: recurring-task
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "recurring-task.selectorLabels" -}}
app.kubernetes.io/name: {{ include "recurring-task.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: recurring-task
{{- end -}}
