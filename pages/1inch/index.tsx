import { OneInchHelper } from '@/app/components/inch/1inch-helper'
import React from 'react'

const helper = new OneInchHelper();
function index() {
  return (
    <div>
      <button onClick={helper.doTheJob.bind(helper)}>do the job</button>
    </div>
  )
}

export default index