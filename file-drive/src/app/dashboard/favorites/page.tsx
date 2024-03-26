'use client'
import React from 'react'
import FileBrowser from '../_components/file-browser'

const FavoritesPage = () => {

    return (
        <div>
            <FileBrowser title="Your Favorite Files" favorites={true} />
        </div>
    )
}

export default FavoritesPage