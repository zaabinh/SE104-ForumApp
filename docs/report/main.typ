// format text
#set text(
 font: "New Computer Modern",
 size: 13.5pt, 
 lang: "vi",
)


// Trang bìa
#include "Chapters/cov.typ"

#show outline.entry.where(level: 1): it => {
  strong(it)
}

// format page
#set page(
  margin: (top: 3cm, bottom: 3cm, right: 2.5cm, left: 2.5cm),
  number-align: center,
  numbering: "1",
  header: [
    #set text(12pt)
    #smallcaps[Nhập môn Công nghệ phần mềm]
    #h(1fr) SE104.Q28
    #line(length: 100%)
  ],
  footer: context [
  #line(length: 100%)
    #smallcaps[Đồ án môn học]
    #h(0.5fr) Trang
    #counter(page).display(
      "1"
    )

  ]
)
#show heading: set text(size: 15pt)
#set par(justify: true)

#include "Chapters/outline.typ"
#include "Chapters/chap1.typ"
#include "Chapters/chap2.typ"
#include "Chapters/chap3.typ"
#include "Chapters/chap4.typ"
#include "Chapters/chap5.typ"
#include "Chapters/chap6.typ"
#include "Chapters/chap7.typ"
#include "Chapters/chap8.typ"

