'use client'

import type { NavItem } from '.'
import { BookOpen, Cloud, Code, Database, HelpCircle, Home, Layers } from 'lucide-react'
import { motion } from 'motion/react'

import { useState } from 'react'
import { Navbar, NavbarDropdownItem, NavbarItem } from '.'
import { ThemeToggle } from '../ThemeToggle'

export default function TestPage() {
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
      className: 'text-textPrimary',
    },
    {
      id: 'products',
      label: 'Products',
      className: 'text-textPrimary',
      dropdownItems: [
        {
          id: 'products-platform',
          label: 'Platform',
          icon: <Layers size={ 16 } />,
          className: 'text-textPrimary hover:bg-backgroundSecondary',
        },
        {
          id: 'products-api',
          label: 'API',
          icon: <Code size={ 16 } />,
          className: 'text-textPrimary hover:bg-backgroundSecondary',
        },
        {
          id: 'products-database',
          label: 'Database',
          icon: <Database size={ 16 } />,
          className: 'text-textPrimary hover:bg-backgroundSecondary',
        },
        {
          id: 'products-cloud',
          label: 'Cloud Services',
          icon: <Cloud size={ 16 } />,
          className: 'text-textPrimary hover:bg-backgroundSecondary',
        },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      className: 'text-textPrimary',
      dropdownItems: [
        {
          id: 'resources-docs',
          label: 'Documentation',
          icon: <BookOpen size={ 16 } />,
          className: 'text-textPrimary hover:bg-backgroundSecondary',
        },
        {
          id: 'resources-help',
          label: 'Help Center',
          icon: <HelpCircle size={ 16 } />,
          className: 'text-textPrimary hover:bg-backgroundSecondary',
        },
      ],
    },
    {
      id: 'pricing',
      label: 'Pricing',
      className: 'text-textPrimary',
    },
  ]

  return (
    <div className="h-screen overflow-auto bg-background text-textPrimary">
      <ThemeToggle></ThemeToggle>

      <div className="space-y-12 px-6 py-8">
        {/* Example 1: Declarative API */ }
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-textPrimary">Declarative API</h2>
          <Navbar
            className="bg-backgroundSecondary/80 py-4 backdrop-blur-md border border-border rounded-lg"
            items={ navItems }
            activeItem={ activeTab }
            onItemClick={ id => handleTabChange(id as NavItemId) }
          />
        </section>

        {/* Example 2: Imperative API */ }
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-textPrimary">Imperative API</h2>
          <Navbar
            className="bg-backgroundSecondary/60 py-4 backdrop-blur-md border border-border rounded-lg"
          >
            <NavbarItem active={ activeTab === 'home' } onClick={ () => handleTabChange('home') } className="text-textPrimary">
              <Home size={ 16 } className="mr-1" />
              { ' ' }
              Home
            </NavbarItem>

            <NavbarItem
              hasDropdown
              active={ isParentActive('products', 'products-') }
              className="text-textPrimary"
              dropdownContent={
                <>
                  <NavbarDropdownItem
                    icon={ <Layers size={ 16 } /> }
                    active={ activeTab === 'products-platform' }
                    onClick={ () => handleTabChange('products-platform') }
                    className="text-textPrimary hover:bg-backgroundSecondary"
                  >
                    Platform
                  </NavbarDropdownItem>
                  <NavbarDropdownItem
                    icon={ <Code size={ 16 } /> }
                    active={ activeTab === 'products-api' }
                    onClick={ () => handleTabChange('products-api') }
                    className="text-textPrimary hover:bg-backgroundSecondary"
                  >
                    API
                  </NavbarDropdownItem>
                  <NavbarDropdownItem
                    icon={ <Database size={ 16 } /> }
                    active={ activeTab === 'products-database' }
                    onClick={ () => handleTabChange('products-database') }
                    className="text-textPrimary hover:bg-backgroundSecondary"
                  >
                    Database
                  </NavbarDropdownItem>
                  <NavbarDropdownItem
                    icon={ <Cloud size={ 16 } /> }
                    active={ activeTab === 'products-cloud' }
                    onClick={ () => handleTabChange('products-cloud') }
                    className="text-textPrimary hover:bg-backgroundSecondary"
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
              className="text-textPrimary"
              dropdownContent={
                <>
                  <NavbarDropdownItem
                    icon={ <BookOpen size={ 16 } /> }
                    active={ activeTab === 'resources-docs' }
                    onClick={ () => handleTabChange('resources-docs') }
                    className="text-textPrimary hover:bg-backgroundSecondary"
                  >
                    Documentation
                  </NavbarDropdownItem>
                  <NavbarDropdownItem
                    icon={ <HelpCircle size={ 16 } /> }
                    active={ activeTab === 'resources-help' }
                    onClick={ () => handleTabChange('resources-help') }
                    className="text-textPrimary hover:bg-backgroundSecondary"
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
              className="text-textPrimary"
            >
              Pricing
            </NavbarItem>
          </Navbar>
        </section>

        {/* Content Display Area */ }
        <section className="mx-auto max-w-4xl">
          <motion.div
            key={ activeTab }
            initial={ { opacity: 0, y: 20 } }
            animate={ { opacity: 1, y: 0 } }
            exit={ { opacity: 0, y: -20 } }
            transition={ { duration: 0.3 } }
            className="border border-border rounded-xl bg-backgroundSecondary/50 p-8 backdrop-blur-sm shadow-lg"
          >
            <h1 className="mb-6 text-4xl font-bold text-textPrimary">
              { activeTab === 'home' && 'Home' }
              { activeTab === 'products-platform' && 'Platform' }
              { activeTab === 'products-api' && 'API' }
              { activeTab === 'products-database' && 'Database' }
              { activeTab === 'products-cloud' && 'Cloud Services' }
              { activeTab === 'resources-docs' && 'Documentation' }
              { activeTab === 'resources-help' && 'Help Center' }
              { activeTab === 'pricing' && 'Pricing' }
            </h1>
            <p className="mb-8 text-lg text-textSecondary leading-relaxed">
              You are currently viewing the
              { ' ' }
              <span className="text-blue-600 font-semibold">{ activeTab }</span>
              { ' ' }
              page. This test page demonstrates both declarative and imperative usage of the Navbar component.
            </p>

            <div className="flex flex-wrap gap-4">
              <motion.button
                className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors duration-200"
                whileHover={ { scale: 1.02 } }
                whileTap={ { scale: 0.98 } }
              >
                Get Started
              </motion.button>

              <motion.button
                className="rounded-lg bg-backgroundSecondary px-6 py-3 text-textPrimary font-medium hover:bg-backgroundSecondary/80 border border-border transition-colors duration-200"
                whileHover={ { scale: 1.02 } }
                whileTap={ { scale: 0.98 } }
              >
                Learn More
              </motion.button>
            </div>
          </motion.div>
        </section>
      </div>
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
