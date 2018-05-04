def label = "griff-react-${UUID.randomUUID().toString().substring(0, 5)}"
podTemplate(
  label: label,
  containers: [containerTemplate(name: 'node',
                                image: 'node:9',
                                envVars: [
                                  envVar(key: 'CI', value: 'true'),
                                  secretEnvVar(
                                    key: 'PR_CLIENT_ID',
                                    secretName: 'pr-server-api-tokens',
                                    secretKey: 'client_id'
                                  ),
                                  secretEnvVar(
                                    key: 'PR_CLIENT_SECRET',
                                    secretName: 'pr-server-api-tokens',
                                    secretKey: 'client_secret'
                                  ),
                                ],
                                resourceRequestCpu: '2000m',
                                resourceRequestMemory: '2500Mi',
                                resourceLimitCpu: '2000m',
                                resourceLimitMemory: '2500Mi',
                                ttyEnabled: true)
  ],
  envVars: [
    envVar(key: 'CHANGE_ID', value: env.CHANGE_ID)
  ],
  volumes: [
    secretVolume(secretName: 'npm-credentials',
                  mountPath: '/npm-credentials',
                  readOnly: true),
  ]) {
    node(label) {
    def gitCommit
    stage("Checkout code") {
      checkout(scm)
      gitCommit = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
    }
    container('node') {
      stage('Install dependencies') {
        sh("cp /npm-credentials/npm-credentials.txt ~/.npmrc")
        sh("cp /npm-credentials/yarn-credentials.txt ~/.yarnrc")
        sh('yarn')
      }
      stage("Test") {
        sh('./test.sh')
      }
      if (env.BRANCH_NAME == 'master') {
        stage('Deploy storybook') {
          sh('yarn storybook:build')
          sh('yarn storybook:deploy')
        }
      } else {
        stage('Build and review PR') {
          sh('./deploy-pr.sh')
        }
      }
    }
  }
}
