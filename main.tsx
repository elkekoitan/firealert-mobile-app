import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Example from './App.FireAlert'
import ErrorBoundary from './src/components/common/ErrorBoundary'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Example />
    </ErrorBoundary>
  </StrictMode>,
)