"use client"

import { useEffect, useState } from "react"
import { Tag, CheckCircle, XCircle } from "lucide-react"

interface Coupon {
  code: string
  discount: number
  active: boolean
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/coupons")
      .then((r) => r.json())
      .then((data) => {
        setCoupons(data.coupons || [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coupons</h1>
          <p className="text-neutral-400 text-sm mt-1">{coupons.length} coupon codes</p>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-6 text-sm text-amber-400">
        Coupon codes are currently hardcoded. A full coupon management system (create/edit/delete with DB storage) will be added when Razorpay is integrated.
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Code</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Discount</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  {[...Array(3)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-neutral-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : coupons.map((coupon) => (
              <tr key={coupon.code} className="hover:bg-neutral-800/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-neutral-500" />
                    <span className="font-mono font-semibold text-white">{coupon.code}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-2xl font-bold text-primary">{coupon.discount}%</span>
                  <span className="text-neutral-500 text-xs ml-1">off</span>
                </td>
                <td className="px-4 py-3">
                  {coupon.active ? (
                    <div className="flex items-center gap-1.5 text-green-400 text-xs">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Active
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-neutral-500 text-xs">
                      <XCircle className="w-3.5 h-3.5" />
                      Inactive
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
