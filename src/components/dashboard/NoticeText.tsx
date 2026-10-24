const URL_PATTERN = /(https?:\/\/[^\s)]*[^\s).])/

// A notice as it was written, with the addresses in it as links.
export function NoticeText({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_PATTERN).map((part, index) =>
        index % 2 === 1 ? (
          <a key={index} href={part} target="_blank" rel="noreferrer" className="text-primary [overflow-wrap:anywhere] hover:underline">
            {part}
          </a>
        ) : (
          part
        )
      )}
    </>
  )
}
