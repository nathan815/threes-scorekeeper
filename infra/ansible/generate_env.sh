set -e

app_id="$AZ_SP_ID"
password="$AZ_SP_PW"
tenant="$AZ_SP_TENANT"
vault_name="$AZ_VAULT"

az login --service-principal -u "$app_id" -p "$password" --tenant "$tenant"

getSecret () {
  local name="$1"
  az keyvault secret show --name "$name" --vault-name "$vault_name" --query "value"
}

setVarInEnvFile () {
  local filename="$1"
  local var="$2"
  local value="$3"

  sed -i "s/$var=.*/$var=$value/" $filename
}

setVarInBackendEnv () {
  setVarInEnvFile "backend.env" $1 $2
}

createBackendEnv () {
  cp backend.template.env backend.env

  setVarInBackendEnv DB_USER $(getSecret "db-user")
  setVarInBackendEnv DB_PASSWORD $(getSecret "db-password")
  setVarInBackendEnv SESSION_SECRET $(getSecret "session-secret")
  setVarInBackendEnv GOOGLE_OAUTH_CLIENT_ID $(getSecret "google-client-id")
  setVarInBackendEnv GOOGLE_OAUTH_SECRET $(getSecret "google-client-secret")
}

createBackendEnv

cp backend.env .env
