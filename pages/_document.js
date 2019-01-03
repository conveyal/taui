import Document, {Head, Main, NextScript} from 'next/document'

export default class MyDocument extends Document {
  render() {
    return (
      <html>
        <Head>
          <link rel='shortcut icon' href='https://d2f1n6ed3ipuic.cloudfront.net/conveyal-128x128.png' type='image/x-icon' />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
