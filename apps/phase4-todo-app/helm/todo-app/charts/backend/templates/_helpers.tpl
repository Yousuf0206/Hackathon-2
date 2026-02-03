{{/*
Backend chart helper templates.
*/}}

{{- define "backend.fullname" -}}
{{- printf "%s-backend" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "backend.name" -}}
backend
{{- end -}}

{{- define "backend.labels" -}}
app.kubernetes.io/name: {{ include "backend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: backend
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "backend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: backend
{{- end -}}
