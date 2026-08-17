pipeline {

    agent any

    environment {
        DOCKER_USER = "bala280601"
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Clone') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh '''
                docker build -t $DOCKER_USER/node-api:$IMAGE_TAG backend
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                sh '''
                docker build -t $DOCKER_USER/react-app:$IMAGE_TAG frontend
                '''
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-creds',
                        usernameVariable: 'USER',
                        passwordVariable: 'PASS'
                    )
                ]) {
                    sh '''
                    echo $PASS | docker login -u $USER --password-stdin
                    '''
                }
            }
        }

        stage('Push Backend') {
            steps {
                sh '''
                docker push $DOCKER_USER/node-api:$IMAGE_TAG
                '''
            }
        }

        stage('Push Frontend') {
            steps {
                sh '''
                docker push $DOCKER_USER/react-app:$IMAGE_TAG
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                kubectl rollout restart deployment backend -n devops
                kubectl rollout restart deployment frontend -n devops
                '''
            }
        }
    }
}
