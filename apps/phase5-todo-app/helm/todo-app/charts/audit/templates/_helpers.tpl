{{/*
Audit Service chart helper templates.
*/}}

{{- define "audit.fullname" -}}
{{- printf "%s-audit" .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "audit.name" -}}
audit
{{- end -}}

{{- define "audit.labels" -}}
app.kubernetes.io/name: {{ include "audit.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: audit
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "audit.selectorLabels" -}}
app.kubernetes.io/name: {{ include "audit.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: audit
{{- end -}}
