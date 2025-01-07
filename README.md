Before trying again, you should:

###Stop any running containers:

docker-compose down

###Remove any existing containers and volumes (if you want a fresh start):

docker-compose down -v

###Then try running again:

docker-compose up --build

###run docker compose for dev
docker-compose --profile dev up --build

###run docker compose for prod
docker-compose --profile prod up --build


###If you still get a port conflict error, you can:

###Check what's using port 3307:

On Windows: netstat -ano | findstr :3307
On Linux/Mac: lsof -i :3307

Development:


docker-compose -f docker-compose.dev.yml up --build
Production (Cloud Run):

Build the production image:

docker build -t gcr.io/[PROJECT-ID]/nurse-exam-api .
Push to Google Container Registry:

docker push gcr.io/[PROJECT-ID]/nurse-exam-api
Deploy to Cloud Run:

gcloud run deploy nurse-exam-api \
  --image gcr.io/[PROJECT-ID]/nurse-exam-api \
  --platform managed \
  --region [REGION] \
  --allow-unauthenticated