"use strict";(self.webpackChunkgatsby_starter_lumen=self.webpackChunkgatsby_starter_lumen||[]).push([[574],{5674:function(e,t,a){a.d(t,{f:function(){return o}});var n=a(7294),l=a(1082),r="Feed-module--link--6123b";var o=e=>{let{edges:t}=e;return n.createElement("div",{className:"Feed-module--feed--a6204"},t.map((e=>{var t,a;return n.createElement("div",{className:"Feed-module--item--c7a63",key:e.node.fields.slug},n.createElement("div",{className:"Feed-module--meta--250c2"},n.createElement("time",{className:"Feed-module--time--72864",dateTime:new Date(e.node.frontmatter.date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})},new Date(e.node.frontmatter.date).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})),n.createElement("span",{className:"Feed-module--divider--81a18"}),n.createElement("span",{className:"Feed-module--category--59f58"},n.createElement(l.Link,{to:e.node.fields.categorySlug,className:r},e.node.frontmatter.category))),n.createElement("h2",{className:"Feed-module--title--f252f"},n.createElement(l.Link,{className:r,to:(null===(t=e.node.frontmatter)||void 0===t?void 0:t.slug)||e.node.fields.slug},e.node.frontmatter.title)),n.createElement("p",{className:"Feed-module--description--57348"},e.node.frontmatter.description),n.createElement(l.Link,{className:"Feed-module--more--51a4e",to:(null===(a=e.node.frontmatter)||void 0===a?void 0:a.slug)||e.node.fields.slug},"Read"))})))}},2140:function(e,t,a){a.d(t,{t:function(){return s}});var n=a(7294),l=a(3967),r=a.n(l),o=a(1082),d=a(100),m="Pagination-module--disable--7e105";var s=e=>{let{prevPagePath:t,nextPagePath:a,hasNextPage:l,hasPrevPage:s}=e;const i=r()("Pagination-module--previousLink--5590d",{[m]:!s}),c=r()("Pagination-module--nextLink--532ff",{[m]:!l});return n.createElement("div",{className:"Pagination-module--pagination--d61cb"},n.createElement("div",{className:"Pagination-module--previous--4a76b"},n.createElement(o.Link,{rel:"prev",to:s?t:"/",className:i},d.X.PREV_PAGE)),n.createElement("div",{className:"Pagination-module--next--1cab8"},n.createElement(o.Link,{rel:"next",to:l?a:"/",className:c},d.X.NEXT_PAGE)))}},5886:function(e,t,a){a.r(t),a.d(t,{Head:function(){return c}});var n=a(7294),l=a(5674),r=a(8840),o=a(9395),d=a(4808),m=a(2140),s=a(20),i=a(1856);const c=e=>{let{pageContext:t}=e;const{title:a,subtitle:l}=(0,i.$W)(),{pagination:{currentPage:r}}=t,d=r>0?"Posts - Page "+r+" - "+a:a;return n.createElement(o.h,{title:d,description:l})};t.default=e=>{let{data:t,pageContext:a}=e;const{pagination:o}=a,{hasNextPage:i,hasPrevPage:c,prevPagePath:u,nextPagePath:g}=o,{edges:P}=t.allMarkdownRemark;return n.createElement(r.A,null,n.createElement(s.Y,{isIndex:!0}),n.createElement(d.T,null,n.createElement(l.f,{edges:P}),n.createElement(m.t,{prevPagePath:u,nextPagePath:g,hasPrevPage:c,hasNextPage:i})))}}}]);
//# sourceMappingURL=component---src-templates-index-template-index-template-tsx-7f2bcaeb39e051d1218a.js.map