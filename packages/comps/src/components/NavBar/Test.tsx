'use client'

import type { NavItem } from '.'
import { BookOpen, Cloud, Code, Database, HelpCircle, Home, Layers } from 'lucide-react'
import { useState } from 'react'
import { Navbar, NavbarDropdownItem, NavbarItem } from '.'
import { GithubSourceLink } from '../GithubSourceLink'
import { ThemeToggle } from '../ThemeToggle'

function TestPage() {
  const [activeTab, setActiveTab] = useState<NavItemId>('home')

  const handleTabChange = (tab: NavItemId) => {
    setActiveTab(tab)
  }

  /** 检查一个父项是否应该被标记为active（当它自己或它的任何子项被选中时） */
  const isParentActive = (id: string, childPrefix: string) => {
    return activeTab === id || activeTab.startsWith(childPrefix)
  }

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: <Home size={ 16 } />,
      className: 'text-text',
    },
    {
      id: 'products',
      label: 'Products',
      className: 'text-text',
      dropdownItems: [
        {
          id: 'products-platform',
          label: 'Platform',
          icon: <Layers size={ 16 } />,
          className: 'text-text hover:bg-background2',
        },
        {
          id: 'products-api',
          label: 'API',
          icon: <Code size={ 16 } />,
          className: 'text-text hover:bg-background2',
        },
        {
          id: 'products-database',
          label: 'Database',
          icon: <Database size={ 16 } />,
          className: 'text-text hover:bg-background2',
        },
        {
          id: 'products-cloud',
          label: 'Cloud Services',
          icon: <Cloud size={ 16 } />,
          className: 'text-text hover:bg-background2',
        },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      className: 'text-text',
      dropdownItems: [
        {
          id: 'resources-docs',
          label: 'Documentation',
          icon: <BookOpen size={ 16 } />,
          className: 'text-text hover:bg-background2',
        },
        {
          id: 'resources-help',
          label: 'Help Center',
          icon: <HelpCircle size={ 16 } />,
          className: 'text-text hover:bg-background2',
        },
      ],
    },
    {
      id: 'pricing',
      label: 'Pricing',
      className: 'text-text',
    },
  ]

  return (
    <div className="h-screen overflow-auto bg-background text-text">
      <ThemeToggle></ThemeToggle>

      <div className="space-y-12 px-6 py-8">
        {/* Example 1: Declarative API */ }
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-text">Declarative API</h2>
          <Navbar
            className="bg-background2/80 py-4 backdrop-blur-md border border-border rounded-lg"
            items={ navItems }
            activeItem={ activeTab }
            onItemClick={ id => handleTabChange(id as NavItemId) }
          />
        </section>

        {/* Example 2: Imperative API */ }
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-text">Imperative API</h2>
          <Navbar
            className="bg-background2/60 py-4 backdrop-blur-md border border-border rounded-lg"
          >
            <NavbarItem active={ activeTab === 'home' } onClick={ () => handleTabChange('home') } className="text-text">
              <Home size={ 16 } className="mr-1" />
              { ' ' }
              Home
            </NavbarItem>

            <NavbarItem
              hasDropdown
              active={ isParentActive('products', 'products-') }
              className="text-text"
              dropdownContent={
                <>
                  <NavbarDropdownItem
                    icon={ <Layers size={ 16 } /> }
                    active={ activeTab === 'products-platform' }
                    onClick={ () => handleTabChange('products-platform') }
                    className="text-text hover:bg-background2"
                  >
                    Platform
                  </NavbarDropdownItem>
                  <NavbarDropdownItem
                    icon={ <Code size={ 16 } /> }
                    active={ activeTab === 'products-api' }
                    onClick={ () => handleTabChange('products-api') }
                    className="text-text hover:bg-background2"
                  >
                    API
                  </NavbarDropdownItem>
                  <NavbarDropdownItem
                    icon={ <Database size={ 16 } /> }
                    active={ activeTab === 'products-database' }
                    onClick={ () => handleTabChange('products-database') }
                    className="text-text hover:bg-background2"
                  >
                    Database
                  </NavbarDropdownItem>
                  <NavbarDropdownItem
                    icon={ <Cloud size={ 16 } /> }
                    active={ activeTab === 'products-cloud' }
                    onClick={ () => handleTabChange('products-cloud') }
                    className="text-text hover:bg-background2"
                  >
                    Cloud Services
                  </NavbarDropdownItem>
                </>
              }
            >
              Products
            </NavbarItem>

            <NavbarItem
              hasDropdown
              active={ isParentActive('resources', 'resources-') }
              className="text-text"
              dropdownContent={
                <>
                  <NavbarDropdownItem
                    icon={ <BookOpen size={ 16 } /> }
                    active={ activeTab === 'resources-docs' }
                    onClick={ () => handleTabChange('resources-docs') }
                    className="text-text hover:bg-background2"
                  >
                    Documentation
                  </NavbarDropdownItem>
                  <NavbarDropdownItem
                    icon={ <HelpCircle size={ 16 } /> }
                    active={ activeTab === 'resources-help' }
                    onClick={ () => handleTabChange('resources-help') }
                    className="text-text hover:bg-background2"
                  >
                    Help Center
                  </NavbarDropdownItem>
                </>
              }
            >
              Resources
            </NavbarItem>

            <NavbarItem
              active={ activeTab === 'pricing' }
              onClick={ () => handleTabChange('pricing') }
              className="text-text"
            >
              Pricing
            </NavbarItem>
          </Navbar>
        </section>
      </div>

      <GithubSourceLink />
    </div>
  )
}

type NavItemId
  = | 'home'
    | 'products'
    | 'products-platform'
    | 'products-api'
    | 'products-database'
    | 'products-cloud'
    | 'resources'
    | 'resources-docs'
    | 'resources-help'
    | 'pricing'

export default TestPage
