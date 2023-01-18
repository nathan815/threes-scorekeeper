# Notes

### Service Principal Set Up

1. Create SP:

`az ad sp create-for-rbac --name deployment-sp`

`export SP_APP_ID=''`

2. Allow it to read KV secrets:

`az role assignment create --role "Key Vault Secrets User" --assignee $SP_APP_ID --scope  /subscriptions/$subId/resourceGroups/threes-game`

3. Allow it to pull from ACR:

`az role assignment create --assignee $SP_APP_ID --scope $ACR_REGISTRY_ID --role acrpull`
