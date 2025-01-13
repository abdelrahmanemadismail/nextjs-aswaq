import React from 'react'

// Export all components in a single object
const PageComponents = {
    h1: (props: React.HTMLProps<HTMLHeadingElement>) => (
        <h1
          className="scroll-m-20 text-4xl font-bold tracking-tight mb-4 text-center"
          {...props}
        />
      ),
      h2: (props: React.HTMLProps<HTMLHeadingElement>) => (
        <h2
          className="scroll-m-20 text-2xl font-semibold tracking-tight mb-4 mt-8"
          {...props}
        />
      ),
      p: (props: React.HTMLProps<HTMLParagraphElement>) => (
        <p className="text-muted-foreground mb-4" {...props} />
      ),
      blockquote: (props: React.HTMLProps<HTMLQuoteElement>) => (
        <blockquote
          className="border-l-2 border-primary pl-6 italic my-8"
          {...props}
        />
      ),
      ul: (props: React.HTMLProps<HTMLUListElement>) => (
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4" {...props} />
      ),
}

export default PageComponents