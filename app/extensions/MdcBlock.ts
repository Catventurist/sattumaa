import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import MdcBlockView from '~/components/mark/BlockView.vue'

export const MdcBlock = Node.create({
  name: 'mdcBlock',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      component: { default: 'u-chart', rendered: false },
      props: { default: {}, rendered: false }
    }
  },

  parseHTML() {
    return [{
      tag: 'div[data-type="mdc-block"]',
      getAttrs: el => ({
        component: (el as HTMLElement).getAttribute('data-component'),
        props: JSON.parse((el as HTMLElement).getAttribute('data-props') || '{}')
      })
    }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, {
      'data-type': 'mdc-block',
      'data-component': node.attrs.component,
      'data-props': JSON.stringify(node.attrs.props)
    })]
  },

  addNodeView() {
    return VueNodeViewRenderer(MdcBlockView)
  }
})
