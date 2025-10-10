import type { PlanData } from './PlanCard'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from 'utils'
import { BgPaths } from 'comps'
import PlanCard from './PlanCard'
import PlanTypeSwitch from './PlanTypeSwitch'
import { PaymentTypeEnum, RechargeTypeEnum } from './types'

export default function Pricing() {
  const planData: Record<RechargeTypeEnum, PlanData[]> = {
    [RechargeTypeEnum.MONTHLY]: [
      {
        title: 'Basic plan',
        desc: 'To try it out',
        price: '29',
        discountedPrice: '26',
        priceUnit: '/month',
        yearPrice: 'Billed as $240 yearly',
        paymentType: PaymentTypeEnum.BASIC_PLAN_MONTHLY,
        features: [
          [
            {
              text: '250',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'credits/mo',
            },
          ],
          [
            {
              text: '1',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'pic/task',
            },
          ],
          [
            {
              text: 'No watermark',
            },
          ],
          [
            {
              text: 'Image storage forever',
            },
          ],
        ],
      },
      {
        title: 'Standard plan',
        desc: 'For agents',
        price: '69',
        discountedPrice: '62',
        priceUnit: '/month',
        yearPrice: 'Billed as $600 yearly',
        paymentType: PaymentTypeEnum.STANDARD_PLAN_MONTHLY,
        features: [
          [
            {
              text: '700',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'credits/mo',
            },
          ],
          [
            {
              text: '5',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'pic/task',
            },
          ],
          [
            {
              text: 'No watermark',
            },
          ],
          [
            {
              text: 'Image storage forever',
            },
          ],
          [
            {
              text: 'All background template',
            },
          ],
        ],
      },
      {
        title: 'Professional plan',
        desc: 'For teams and top producers',
        price: '199',
        discountedPrice: '188',
        priceUnit: '/month',
        yearPrice: 'Billed as $1800 yearly',
        paymentType: PaymentTypeEnum.PROFESSIONAL_PLAN_MONTHLY,
        features: [
          [
            {
              text: '2500',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'credits/mo',
            },
          ],
          [
            {
              text: '10',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'pic/task',
            },
          ],
          [
            {
              text: 'No watermark',
            },
          ],
          [
            {
              text: 'Image storage forever',
            },
          ],
          [
            {
              text: 'All background template',
            },
          ],
        ],
      },
      {
        title: 'Enterprise plan',
        desc: 'For Manufacturers and Retailers',
        price: 'Contact us',
        priceUnit: '',
        discountedPrice: '',
        yearPrice: '',
        paymentType: PaymentTypeEnum.ENTERPRISE_PLAN_MONTHLY,
        features: [
          [
            {
              text: 'Unlimited',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'pic/task',
            },
          ],
          [
            {
              text: 'No watermark',
            },
          ],
          [
            {
              text: 'Image storage forever',
            },
          ],
          [
            {
              text: 'All background template',
            },
          ],
          [
            {
              text: 'Enterprise support with a personal success manager',
            },
          ],
        ],
      },
    ],
    [RechargeTypeEnum.YEARLY]: [
      {
        title: 'Basic plan',
        desc: 'To try it out',
        price: '20',
        discountedPrice: '16',
        priceUnit: '/month',
        yearPrice: 'Billed as $240 yearly',
        paymentType: PaymentTypeEnum.BASIC_PLAN_YEARLY,
        features: [
          [
            {
              text: '250',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'credits/mo',
            },
          ],
          [
            {
              text: '1',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'pic/task',
            },
          ],
          [
            {
              text: 'No watermark',
            },
          ],
          [
            {
              text: 'Image storage forever',
            },
          ],
        ],
      },
      {
        title: 'Standard plan',
        desc: 'For agents',
        price: '50',
        discountedPrice: '42',
        priceUnit: '/month',
        yearPrice: 'Billed as $600 yearly',
        paymentType: PaymentTypeEnum.STANDARD_PLAN_YEARLY,
        features: [
          [
            {
              text: '700',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'credits/mo',
            },
          ],
          [
            {
              text: '5',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'pic/task',
            },
          ],
          [
            {
              text: 'No watermark',
            },
          ],
          [
            {
              text: 'Image storage forever',
            },
          ],
          [
            {
              text: 'All background template',
            },
          ],
        ],
      },
      {
        title: 'Professional plan',
        desc: 'For teams and top producers',
        price: '150',
        discountedPrice: '142',
        priceUnit: '/month',
        yearPrice: 'Billed as $1800 yearly',
        paymentType: PaymentTypeEnum.PROFESSIONAL_PLAN_YEARLY,
        features: [
          [
            {
              text: '2500',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'credits/mo',
            },
          ],
          [
            {
              text: '10',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'pic/task',
            },
          ],
          [
            {
              text: 'No watermark',
            },
          ],
          [
            {
              text: 'Image storage forever',
            },
          ],
          [
            {
              text: 'All background template',
            },
          ],
        ],
      },
      {
        title: 'Enterprise plan',
        desc: 'For Manufacturers and Retailers',
        price: 'Contact us',
        discountedPrice: '',
        priceUnit: '',
        yearPrice: '',
        paymentType: PaymentTypeEnum.ENTERPRISE_PLAN_YEARLY,
        features: [
          [
            {
              text: 'Unlimited',
              className: 'text-blue-600 font-bold',
            },
            {
              text: 'pic/task',
            },
          ],
          [
            {
              text: 'No watermark',
            },
          ],
          [
            {
              text: 'Image storage forever',
            },
          ],
          [
            {
              text: 'All background template',
            },
          ],
          [
            {
              text: 'Enterprise support with a personal success manager',
            },
          ],
        ],
      },
    ],
    [RechargeTypeEnum.REPLENISH]: [
      {
        title: 'Extra Plan Low',
        desc: '',
        price: '35',
        discountedPrice: '29',
        priceUnit: '',
        yearPrice: '',
        paymentType: PaymentTypeEnum.EXTRA_PLAN_LOW,
        features: [
          [
            {
              text: '250',
              className: 'text-blue-600 font-bold',
            },
            {
              text: ' credits',
            },
          ],
        ],
      },
      {
        title: 'Extra Plan Middle',
        desc: '',
        price: '89',
        discountedPrice: '82',
        priceUnit: '',
        yearPrice: '',
        paymentType: PaymentTypeEnum.EXTRA_PLAN_MIDDLE,
        features: [
          [
            {
              text: '700',
              className: 'text-blue-600 font-bold',
            },
            {
              text: ' credits',
            },
          ],
        ],
      },
      {
        title: 'Extra Plan High',
        desc: '',
        price: '249',
        discountedPrice: '242',
        priceUnit: '',
        yearPrice: '',
        paymentType: PaymentTypeEnum.EXTRA_PLAN_HIGH,
        features: [
          [
            {
              text: '2500',
              className: 'text-blue-600 font-bold',
            },
            {
              text: ' credits',
            },
          ],
        ],
      },
    ],
  }

  const [planType, setPlanType] = useState<RechargeTypeEnum>(RechargeTypeEnum.MONTHLY)
  const [selectedPlan, setSelectedPlan] = useState<PlanData | null>(planData[planType][0])

  const onPlanChoose = useCallback(async (d: PlanData) => {

  }, [])

  return (
    <div className="relative min-h-screen overflow-auto from-gray-800 via-slate-900 to-blue-900 bg-gradient-to-br py-16">
      {/* Background gradient */ }
      <motion.div
        className={ cn(
          'absolute top-12 left-0 w-xl h-xl max-sm:w-96 max-sm:h-96 rounded-full blur-3xl',
        ) }
        style={ {
          backgroundColor: 'rgba(37, 120, 216, 0.86)',
        } }
        animate={ {
          opacity: [0.3, 0.4, 0.3],
          scale: [0.9, 1.2, 0.9],
          rotate: [-15, 15, -15],
          x: ['0%', '-8%', '0%'],
          y: ['0%', '15%', '0%'],
        } }
        transition={ {
          duration: 6,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse',
          times: [0, 0.5, 1],
        } }
      />

      <BgPaths
        className="absolute inset-0"
        svgClassName="text-blue-900/80"
      />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={ { opacity: 0, y: -20 } }
          animate={ { opacity: 1, y: 0 } }
          className="text-center"
        >
          <h1 className="text-4xl text-white font-bold sm:text-5xl">Pricing</h1>
          <p className="mt-4 text-lg text-gray-400">Choose the perfect plan for you</p>
        </motion.div>

        <div className="mt-12">
          <PlanTypeSwitch
            value={ planType }
            onChange={ (type) => {
              setPlanType(type)
              setSelectedPlan(planData[type][0])
            } }
            className="mx-auto max-w-sm"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            initial={ { opacity: 0 } }
            animate={ { opacity: 1 } }
            exit={ { opacity: 0 } }
            transition={ { duration: 0.3 } }
            className="grid mt-16 gap-8 lg:grid-cols-4 sm:grid-cols-2"
          >
            { planData[planType].map((plan, index) => (
              <PlanCard
                key={ plan.paymentType }
                plan={ plan }
                index={ index }
                isSelected={ selectedPlan?.paymentType === plan.paymentType }
                onClick={ setSelectedPlan }
                onChoosePlan={ onPlanChoose }
              />
            )) }
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

Pricing.displayName = 'RechargePage'
