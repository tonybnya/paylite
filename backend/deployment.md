# Deploying PayLite Backend to Hugging Face Spaces 

Follow these steps to deploy your backend to Hugging Face Spaces.

## 1. Prerequisites
- A GitHub repository containing your `backend` folder.
- A [Hugging Face account](https://huggingface.co/join) (Free, no credit card required).

## 2. Hugging Face Setup
1. Log in to your Hugging Face account.
2. Click **New Space** (plus icon in the top right).
3. Name your space (e.g., `paylite-backend`).
4. Select **Docker** as the SDK.
5. Select **Blank** (or any simple template).
6. Set the Space as **Public** (required for the free tier API access).
7. Click **Create Space**.

## 3. Configuration
1. Go to the **Settings** tab of your new Space.
2. Scroll to the **Variables and secrets** section.
3. Add the following **Secrets** (these are private):
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `SECRET_KEY`: A strong random string.
4. Add the following **Variables** (these are public):
   - `FLASK_CONFIG`: `prod`
   - `JWT_ACCESS_TOKEN_EXPIRES`: `3600`

## 4. Automatic Deployment (GitHub Actions)
Since your project is a monorepo, we'll use a GitHub Action to sync only the `backend` folder to Hugging Face.

1. **Get your HF Token**:
   - Go to [Hugging Face Settings > Access Tokens](https://huggingface.co/settings/tokens).
   - Create a new token with **Write** access.
2. **Add Secret to GitHub**:
   - Go to your GitHub repository **Settings > Secrets and variables > Actions**.
   - Create a New repository secret:
     - Name: `HF_TOKEN`
     - Value: (Your Hugging Face token)
3. **Verify Workflow**:
   - I have already created the workflow file at `.github/workflows/deploy-backend.yml`.
   - **Important**: Open that file and ensure the repository URL `https://tonybnya:$HF_TOKEN@huggingface.co/spaces/tonybnya/paylite-backend` matches your actual Hugging Face username and Space name.
4. **Trigger Sync**:
   - Commit and push your changes to the `main` branch.
   - Go to the **Actions** tab in GitHub to watch the sync progress.

## 5. Verification
Once the GitHub Action completes and the Hugging Face build finishes, your API will be available at:
`https://<username>-<space-name>.hf.space`

### Verify Connectivity
```bash
curl https://<username>-<space-name>.hf.space/health
```

### Keep Awake (Optional)
Hugging Face Spaces sleep after 48 hours of inactivity. To keep it awake 24/7, you can use [UptimeRobot](https://uptimerobot.com/) to ping your `/health` endpoint every 30 minutes for free.
