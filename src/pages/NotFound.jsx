import { Link } from 'react-router-dom'
import Card from '../components/ui/Card'

const NotFound = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2>Page not found</h2>
        <p>The requested page does not exist.</p>
        <Link to="/">Return to dashboard</Link>
      </Card>
    </div>
  )
}

export default NotFound
