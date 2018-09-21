static final String REPO = "griff-react"
static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String BASE_URL_BRANCH="griff-"
static final String BASE_URL_PR="griff-react-pr-"
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
                                    secretKey: 'SURGE_LOGIN'
                                  ),
                                  secretEnvVar(
                                    key: 'SURGE_TOKEN',
                                    secretName: 'griff-react-surge-token',
                                    secretKey: 'SURGE_TOKEN'
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
    secretVolume(secretName: 'cognite-cicd-ssh-dupe',
                  mountPath: '/cognite-cicd-ssh',
                  readOnly: true),
  ]) {
    properties([buildDiscarder(logRotator(daysToKeepStr: '30', numToKeepStr: '20'))])
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
        sh('yarn storybook:build')
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
          sh('yarn global add surge')
          sh("surge .out ${BASE_URL_PR}${env.CHANGE_ID}.surge.sh")
        }

        stage('Comment on GitHub') {
          pullRequest.comment("${PR_COMMENT_MARKER}The storybook for this PR is hosted on https://${BASE_URL_PR}${env.CHANGE_ID}.surge.sh")
        }
      } else {
        if (env.BRANCH_NAME == 'master' || env.BRANCH_NAME == '0.3') {
          sh('yarn release')
        }
        stage('Deploy storybook') {
          sh('yarn global add surge')
          sh("surge .out ${BASE_URL_BRANCH}${BRANCH_NAME.replaceAll('\\.', '-')}.surge.sh")
        }
      }
    }
  }
}
