'use client'

import type { NavItem } from '.'
import { motion } from 'framer-motion'
import { BookOpen, Cloud, Code, Database, HelpCircle, Home, Layers } from 'lucide-react'

import { useState } from 'react'
import { Navbar, NavbarDropdownItem, NavbarItem } from '.'

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
      className: 'text-slate-200',
    },
    {
      id: 'products',
      label: 'Products',
      className: 'text-slate-200',
      dropdownItems: [
        {
          id: 'products-platform',
          label: 'Platform',
          icon: <Layers size={ 16 } />,
          className: 'text-slate-200 hover:bg-slate-700/50',
        },
        {
          id: 'products-api',
          label: 'API',
          icon: <Code size={ 16 } />,
          className: 'text-slate-200 hover:bg-slate-700/50',
        },
        {
          id: 'products-database',
          label: 'Database',
          icon: <Database size={ 16 } />,
          className: 'text-slate-200 hover:bg-slate-700/50',
        },
        {
          id: 'products-cloud',
          label: 'Cloud Services',
          icon: <Cloud size={ 16 } />,
          className: 'text-slate-200 hover:bg-slate-700/50',
        },
      ],
    },
    {
      id: 'resources',
      label: 'Resources',
      className: 'text-slate-200',
      dropdownItems: [
        {
          id: 'resources-docs',
          label: 'Documentation',
          icon: <BookOpen size={ 16 } />,
          className: 'text-slate-200 hover:bg-slate-700/50',
        },
        {
          id: 'resources-help',
          label: 'Help Center',
          icon: <HelpCircle size={ 16 } />,
          className: 'text-slate-200 hover:bg-slate-700/50',
        },
      ],
    },
    {
      id: 'pricing',
      label: 'Pricing',
      className: 'text-slate-200',
    },
  ]

  return (
    <div className="h-screen overflow-auto from-slate-950 to-slate-900 bg-linear-to-b text-slate-200">
      {/* Example 1: Declarative API */ }
      <Navbar
        className="bg-slate-900/90 py-4 backdrop-blur-md"
        items={ navItems }
        activeItem={ activeTab }
        onItemClick={ id => handleTabChange(id as NavItemId) }
      />

      {/* Example 2: Imperative API */ }
      <Navbar
        className="bg-slate-800/90 py-4 backdrop-blur-md"
      >
        <NavbarItem active={ activeTab === 'home' } onClick={ () => handleTabChange('home') } className="text-slate-200">
          <Home size={ 16 } className="mr-1" />
          { ' ' }
          Home
        </NavbarItem>

        <NavbarItem
          hasDropdown
          active={ isParentActive('products', 'products-') }
          className="text-slate-200"
          dropdownContent={
            <>
              <NavbarDropdownItem
                icon={ <Layers size={ 16 } /> }
                active={ activeTab === 'products-platform' }
                onClick={ () => handleTabChange('products-platform') }
                className="text-slate-200 hover:bg-slate-700/50"
              >
                Platform
              </NavbarDropdownItem>
              <NavbarDropdownItem
                icon={ <Code size={ 16 } /> }
                active={ activeTab === 'products-api' }
                onClick={ () => handleTabChange('products-api') }
                className="text-slate-200 hover:bg-slate-700/50"
              >
                API
              </NavbarDropdownItem>
              <NavbarDropdownItem
                icon={ <Database size={ 16 } /> }
                active={ activeTab === 'products-database' }
                onClick={ () => handleTabChange('products-database') }
                className="text-slate-200 hover:bg-slate-700/50"
              >
                Database
              </NavbarDropdownItem>
              <NavbarDropdownItem
                icon={ <Cloud size={ 16 } /> }
                active={ activeTab === 'products-cloud' }
                onClick={ () => handleTabChange('products-cloud') }
                className="text-slate-200 hover:bg-slate-700/50"
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
          className="text-slate-200"
          dropdownContent={
            <>
              <NavbarDropdownItem
                icon={ <BookOpen size={ 16 } /> }
                active={ activeTab === 'resources-docs' }
                onClick={ () => handleTabChange('resources-docs') }
                className="text-slate-200 hover:bg-slate-700/50"
              >
                Documentation
              </NavbarDropdownItem>
              <NavbarDropdownItem
                icon={ <HelpCircle size={ 16 } /> }
                active={ activeTab === 'resources-help' }
                onClick={ () => handleTabChange('resources-help') }
                className="text-slate-200 hover:bg-slate-700/50"
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
          className="text-slate-200"
        >
          Pricing
        </NavbarItem>
      </Navbar>

      <div className="mx-auto px-6 pt-96 container">
        <motion.div
          key={ activeTab }
          initial={ { opacity: 0, y: 20 } }
          animate={ { opacity: 1, y: 0 } }
          exit={ { opacity: 0, y: -20 } }
          transition={ { duration: 0.3 } }
          className="border border-slate-700/50 rounded-lg bg-slate-800/30 p-8 backdrop-blur-xs"
        >
          <h1 className="mb-6 text-3xl text-white font-bold">
            { activeTab === 'home' && 'Home' }
            { activeTab === 'products-platform' && 'Platform' }
            { activeTab === 'products-api' && 'API' }
            { activeTab === 'products-database' && 'Database' }
            { activeTab === 'products-cloud' && 'Cloud Services' }
            { activeTab === 'resources-docs' && 'Documentation' }
            { activeTab === 'resources-help' && 'Help Center' }
            { activeTab === 'pricing' && 'Pricing' }
          </h1>
          <p className="text-slate-300">
            You are currently viewing the
            { ' ' }
            <span className="text-purple-400 font-medium">{ activeTab }</span>
            { ' ' }
            page. This
            test page demonstrates both declarative and imperative usage of the Navbar component.
          </p>

          <div className="mt-8 flex gap-4">
            <motion.button
              className="rounded-md bg-purple-600 px-4 py-2 text-white font-medium hover:bg-purple-700"
              whileHover={ { scale: 1.03 } }
              whileTap={ { scale: 0.97 } }
            >
              Get Started
            </motion.button>

            <motion.button
              className="rounded-md bg-slate-700/50 px-4 py-2 text-white font-medium hover:bg-slate-700"
              whileHover={ { scale: 1.03 } }
              whileTap={ { scale: 0.97 } }
            >
              Learn More
            </motion.button>
          </div>
        </motion.div>
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
