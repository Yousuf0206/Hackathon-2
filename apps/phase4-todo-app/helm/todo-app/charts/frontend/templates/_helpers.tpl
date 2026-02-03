{{/*
Frontend chart helper templates.
*/}}

{{- define "frontend.fullname" -}}
{{- printf "%s-frontend" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "frontend.name" -}}
frontend
{{- end -}}

{{- define "frontend.labels" -}}
app.kubernetes.io/name: {{ include "frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: frontend
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "frontend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "frontend.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: frontend
{{- end -}}
