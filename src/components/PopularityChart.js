export default function PopularityChart({ popularity }) {
  const filledDivs = Math.round(popularity / 12)
  let divs = []
  for (let i = 0; i < 12; i++) {
    divs.push(<div key={i} className={`w-0.5 h-3 mr-0.5`} style={{ backgroundColor: i <= filledDivs ? '#dfdccd' : '#565258' }} />)
  }
  return <div className="flex">{divs}</div>
}
