pipeline {
    agent any

    stages {
        
        stage('Deploy') {
            steps {
                sh '''
                cd /root/vps-deployement

                git fetch origin 

                git reset --hard origin/main

                docker compose down

                docker compose up -d --build

                docker image prune -af
                '''
            }
        }
    }
}