import { Navigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import LoadingState from '../../interview/loader/Loadingstate'

const Protected = ({ children }) => {
    const { loading, user } = useAuth()

    if (loading) {
        return (<main><LoadingState messages={['Loading...']} /></main>)
    }

    if(!user) {
        return <Navigate to={"/login"} />
    }

  return children
}

export default Protected