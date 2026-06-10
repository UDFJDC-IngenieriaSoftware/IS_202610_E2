# Despliegue en Azure (VM gratuita - Azure for Students)

Arquitectura:
- **1 Azure VM B1S (Linux, Ubuntu 22.04)** → incluida gratis 12 meses en Azure for Students (750 hs/mes)
- **Docker + Docker Compose** en la VM, corriendo:
  - **PostgreSQL** (contenedor)
  - **Backend** (Express, `Dockerfile.prod`)
  - **Frontend** (React build servido por nginx, `Dockerfile.prod`)
  - **Caddy** → reverse proxy + HTTPS automático (Let's Encrypt)

Todo el tráfico entra por Caddy (puertos 80/443):
- `/api/*` y `/uploads/*` → backend
- todo lo demás → frontend

## 0. Variables de ejemplo

```
RESOURCE_GROUP=arriendos360-rg
LOCATION=eastus
VM_NAME=arriendos360-vm
VM_USER=azureuser
DNS_LABEL=arriendos360   # quedará como arriendos360.eastus.cloudapp.azure.com
```

## 1. Login y grupo de recursos

```bash
az login
az group create --name $RESOURCE_GROUP --location $LOCATION
```

## 2. Crear la VM (tamaño Standard_B1s, gratis con Azure for Students)

```bash
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username $VM_USER \
  --generate-ssh-keys \
  --public-ip-sku Standard
```

> Verifica en el portal (Azure for Students > "Servicios gratuitos") que `Standard_B1s` esté dentro de tu cuota gratuita de 12 meses para evitar que consuma créditos.

## 3. Abrir puertos 80 y 443

```bash
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 80 --priority 1001
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 443 --priority 1002
```

## 4. Asignar un nombre de dominio gratuito (DNS label)

Esto te da un dominio tipo `arriendos360.eastus.cloudapp.azure.com`, necesario para que Caddy pueda emitir un certificado HTTPS automático.

```bash
PUBLIC_IP_NAME=$(az vm show -g $RESOURCE_GROUP -n $VM_NAME --query "networkProfile.networkInterfaces[0].id" -o tsv | xargs -I{} az network nic show --ids {} --query "ipConfigurations[0].publicIPAddress.id" -o tsv | xargs -I{} az network public-ip show --ids {} --query "name" -o tsv)

az network public-ip update \
  --resource-group $RESOURCE_GROUP \
  --name $PUBLIC_IP_NAME \
  --dns-name $DNS_LABEL
```

Tu dominio será: `$DNS_LABEL.$LOCATION.cloudapp.azure.com`

## 5. Conectarte por SSH

```bash
az vm show -d -g $RESOURCE_GROUP -n $VM_NAME --query publicIps -o tsv
ssh $VM_USER@<IP_PUBLICA_O_DOMINIO>
```

## 6. Instalar Docker y Docker Compose en la VM

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# cierra sesión y vuelve a entrar para que el grupo "docker" tenga efecto
exit
```

Vuelve a conectarte por SSH y verifica:

```bash
docker --version
docker compose version
```

## 7. (Recomendado) Agregar swap — la B1S solo tiene 1 GB de RAM

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## 8. Clonar el repositorio

```bash
sudo apt install -y git
git clone <URL_DE_TU_REPO>
cd IS_202610_E2
```

## 9. Configurar variables de entorno de producción

```bash
cp .env.prod.example .env
nano .env
```

Completa:
- `DB_PASSWORD`: contraseña fuerte para Postgres
- `JWT_SECRET`: cadena larga y aleatoria
- `DOMAIN`: el dominio del paso 4 (`arriendos360.eastus.cloudapp.azure.com`)

## 10. Levantar la aplicación

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

La primera vez tardará varios minutos (build de frontend y backend). Verifica que todo esté corriendo:

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f
```

## 11. Verificar

Abre en el navegador:

```
https://<DNS_LABEL>.<LOCATION>.cloudapp.azure.com
```

Caddy obtiene el certificado HTTPS automáticamente la primera vez (puede tardar unos segundos).

## 12. Actualizar la app tras cambios en el código

```bash
cd IS_202610_E2
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Notas importantes

- **Persistencia**: los datos de Postgres y los archivos subidos (`backend/uploads`) se guardan en volúmenes Docker (`db_data`, `uploads_data`), por lo que sobreviven a reinicios y redeploys.
- **Backups**: considera hacer `docker exec arriendos360_db pg_dump -U postgres arriendos360_db > backup.sql` periódicamente.
- **Costos**: la VM `Standard_B1s` está cubierta por el beneficio "Always Free" de 12 meses de Azure for Students (750 hs/mes). Si la apagas y prendes varias veces o usas un tamaño mayor, podría empezar a consumir tu crédito de $100 — revisa el portal de "Cost Management".
- **Seguridad básica**: considera configurar `ufw` (firewall del SO) además del NSG de Azure, y mantener el sistema actualizado (`sudo apt upgrade`).
- **CORS**: como todo se sirve bajo el mismo dominio (Caddy hace de proxy), no hay problemas de CORS entre frontend y backend.
