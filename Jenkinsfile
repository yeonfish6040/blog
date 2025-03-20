pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'GHCR', passwordVariable: 'password', usernameVariable: 'username')]) {
                        sh """
                        echo $password | docker login ghcr.io --username $username --password-stdin
                        docker build -f Dockerfile -t ghcr.io/$username/blog .
                        """
                    }
                }
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'GHCR', passwordVariable: 'password', usernameVariable: 'username')]) {
                        sh """
                        docker push ghcr.io/$username/blog
                        """
                    }
                }
            }
        }

        stage('Deploy to Prod') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'GHCR', passwordVariable: 'password', usernameVariable: 'username')]) {
                        sh """
                        docker ps
                        docker stop blog || true
                        docker rm blog || true
                        docker pull ghcr.io/$username/blog
                        docker run -it -d --name blog --restart always -p 9007:80 ghcr.io/$username/blog
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}