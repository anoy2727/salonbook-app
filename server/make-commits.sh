#!/usr/bin/env bash
# Creates 14 meaningful commits. Run inside the server folder after `git init`.
set -e
c() { git add $2 && git commit -m "$1" -q && echo "✔ $1"; }
c "chore: initialize Express project with package.json and gitignore" ".gitignore package.json package-lock.json"
c "docs: add environment variable example file" ".env.example"
c "feat: add constants for categories and time slots" "src/constants.js"
c "feat: add MongoDB connection helper" "src/db.js"
c "feat: add JWT verification and role middleware" "src/middleware/auth.js"
c "feat: add public services API with search, filter and sorting" "src/routes/services.js"
c "feat: add appointment aggregation helper and booking API" "src/lib/pipeline.js src/routes/appointments.js"
c "feat: add Stripe checkout and verified webhook handler" "src/routes/payments.js"
c "feat: add profile API that protects role and blocked status" "src/routes/me.js"
c "feat: add ImgBB image upload endpoint" "src/routes/upload.js"
c "feat: add admin APIs for services, appointments, users and transactions" "src/routes/admin.js"
c "feat: wire up Express app, CORS, raw webhook body and error handlers" "index.js"
c "chore: add seed and make-admin scripts" "scripts"
c "docs: add README and Vercel config" "README.md vercel.json make-commits.sh"
