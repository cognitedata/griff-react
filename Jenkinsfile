@Library('jenkins-helpers') _

static final String REPO = "griff-react"
static final String PR_COMMENT_MARKER = "[pr-server]\n"
static final String BASE_URL_BRANCH="griff-"
static final String BASE_URL_PR="griff-react-pr-"
static final String DEPLOY_URL="griff.surge.sh"

def label = "${REPO}-${UUID.randomUUID().toString().substring(0, 5)}"
podTemplate(
  label: label,
  containers: [containerTemplate(name: 'node',
                                image: 'node:10',
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
                                resourceRequestMemory: '5000Mi',
                                resourceLimitCpu: '2000m',
                                resourceLimitMemory: '5000Mi',
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

    def context_checkout = "continuous-integration/jenkins/checkout"
    def context_setup = "continuous-integration/jenkins/setup"
    def context_lint = "continuous-integration/jenkins/lint"
    def context_unitTests = "continuous-integration/jenkins/unit-tests"
    def context_storybook = "continuous-integration/jenkins/storybook"
    def context_buildRelease = "continuous-integration/jenkins/build-release"

    def isPullRequest = !!env.CHANGE_ID

    def gitCommit
    stageWithNotify('Checkout code', context_checkout) {
      checkout(scm)
      gitCommit = sh(
        returnStdout: true,
        script: 'git rev-list --oneline --max-count=1 HEAD'
      ).trim()
    }
    container('node') {
      stageWithNotify('Install dependencies', context_setup) {
        sh('cp /npm-credentials/npm-public-credentials.txt ~/.npmrc')
        sh('yarn')
        archiveArtifacts artifacts: 'yarn.lock'
      }

      parallel(
        'Lint': {
          stageWithNotify('Link', context_lint) {
            sh("yarn lint")
          }
        },
        'Test': {
          stageWithNotify('Test', context_unitTests) {
            sh("yarn test")
          }
        },
        'Build': {
          stageWithNotify('Build', context_buildRelease) {
            sh("yarn clean")
            sh("yarn build")
          }
        },
        'Build storybook': {
          stageWithNotify('Build storybook', context_storybook) {
            // Increase the heap size.
            sh("export NODE_OPTIONS='--max-old-space-size=2048' ; yarn storybook:build")

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
            }
          }
        }
      )

      if (!isPullRequest) {
        if (env.BRANCH_NAME == 'master' || env.BRANCH_NAME ==~ /^\d+\.\d+$/) {
          stage('Publish release') {
            try{
              sh('yarn release')

              sh('yarn global add surge')
              sh("surge .out ${BASE_URL_BRANCH}${BRANCH_NAME.replaceAll('\\.', '-')}.surge.sh")

              msg = readFile('publish.msg')
              slackSend(
                channel: '#griff',
                color: '#00CC00',
                message: msg
              )
            } catch (e) {
              def msg = """
Release of `${env.BRANCH_NAME}` failed to publish!
>${gitCommit}
${env.RUN_DISPLAY_URL}

@channel
""".trim()
              slackSend(
                channel: '#griff',
                color: '#CC0000',
                message: msg
              )
              throw e;
            }
          }
        }
      }
    }
  }
}
