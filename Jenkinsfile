static final String REPO = "griff-react"
static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String BASE_PR_URL="griff-react-pr-"
static final String DEPLOY_URL="griff.surge.sh"

def label = "${REPO}-${UUID.randomUUID().toString().substring(0, 5)}"
podTemplate(
  label: label,
  containers: [containerTemplate(name: 'node',
                                image: 'node:9',
                                envVars: [
                                  envVar(key: 'CI', value: 'true'),
                                  envVar(key: 'NODE_PATH', value: 'src/'),
                                  secretEnvVar(
                                    key: 'SURGE_LOGIN',
                                    secretName: 'griff-react-surge-token',
                                    secretKey: 'login'
                                  ),
                                  secretEnvVar(
                                    key: 'SURGE_TOKEN',
                                    secretName: 'griff-react-surge-token',
                                    secretKey: 'token'
                                  ),
                                ],
                                resourceRequestCpu: '2000m',
                                resourceRequestMemory: '2500Mi',
                                resourceLimitCpu: '2000m',
                                resourceLimitMemory: '2500Mi',
                                ttyEnabled: true)
  ],
  envVars: [
    envVar(key: 'CHANGE_ID', value: env.CHANGE_ID),
  ],
  volumes: [
    secretVolume(secretName: 'npm-credentials',
                  mountPath: '/npm-credentials',
                  readOnly: true),
  ]) {
    node(label) {
    def gitCommit
    stage('Checkout code') {
      checkout(scm)
    }
    container('node') {
      stage('Install dependencies') {
        sh('cp /npm-credentials/npm-public-credentials.txt ~/.npmrc')
        sh('yarn')
      }

      stage('Build storybook') {
        sh('yarn build:storybook')
      }
      if (env.CHANGE_ID) {
        // This needs to follow the delete-pr.sh step because we don't want to
        // remove the comments if the teardown didn't succeed.
        stage('Remove GitHub comments') {
          pullRequest.comments.each({
            if (it.body.startsWith(PR_COMMENT_MARKER) && it.user == "cognite-cicd") {
              pullRequest.deleteComment(it.id)
            }
          })
        }

        stage('Deploy PR') {
          sh("surge .out ${BASE_URL_PR}${env.CHANGE_ID}.surge.sh")
        }

        stage('Comment on GitHub') {
          pullRequest.comment("${PR_COMMENT_MARKER}The storybook for this PR is hosted on https://${BASE_URL_PR}-${env.CHANGE_ID}.surge.sh")
        }
      
      } else if (env.BRANCH_NAME == 'master') {
        stage('Deploy storybook') {
          sh("surge .out ${DEPLOY_URL}")
        }
      }
    }
  }
}
