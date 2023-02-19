import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import markdownStyles from './markdown-styles.module.css'

type Props = {
  content: string
  imageSizes: Record<string, { width: number; height: number }>
}

const PostBody = ({ content, imageSizes }: Props) => {
  return (
    <div className="max-w-2xl mx-auto">
      <ReactMarkdown
        className={markdownStyles['markdown']}
        components={{
          img: (props) => {
            if (imageSizes[props.src]) {
              const { src, alt } = props
              const { width, height } = imageSizes[props.src]
              return <Image src={src} alt={alt} width={width} height={height} />
            } else {
              return <img {...props} />
            }
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export default PostBody
