# Notes

### Service Principal Set Up

1. Create SP:

`az ad sp create-for-rbac --name deployment-sp`

`export SUB_ID=''`
`export SP_APP_ID=''`

2. Allow it to read KV secrets:

`az role assignment create --role "Key Vault Secrets User" --assignee $SP_APP_ID --scope  /subscriptions/$SUB_ID/resourceGroups/threes-game`

3. Allow it to pull from ACR:

`az role assignment create --role acrpull --assignee $SP_APP_ID --scope $ACR_REGISTRY_ARM_ID`

4. Allow it to manage NSGs:

`az role assignment create --role "Network Contributor" --assignee $SP_APP_ID --scope /subscriptions/$SUB_ID/resourceGroups/threes-game`
