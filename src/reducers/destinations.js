import {handleActions} from 'redux-actions'

const initialDestinationsState = {
  selected: 'None',
  sets: [
    {
      'name': 'geoid10',
      'id': 'geoid10'
    },
    {
      'name': 'cbsa_pop',
      'id': 'cbsa_pop'
    },
    {
      'name': 'Jobs - High Wage',
      'id': 'Jobs - High Wage'
    },
    {
      'name': 'd1c8_ed10',
      'id': 'd1c8_ed10'
    },
    {
      'name': 'd4a',
      'id': 'd4a'
    },
    {
      'name': 'd2b_e8mixa',
      'id': 'd2b_e8mixa'
    },
    {
      'name': 'd4c',
      'id': 'd4c'
    },
    {
      'name': 'd4d',
      'id': 'd4d'
    },
    {
      'name': 'd1c8_ent10',
      'id': 'd1c8_ent10'
    },
    {
      'name': 'e_fedt10',
      'id': 'e_fedt10'
    },
    {
      'name': 'd5ae',
      'id': 'd5ae'
    },
    {
      'name': 'the_geom',
      'id': 'the_geom'
    },
    {
      'name': 'Workers - Medium Wage',
      'id': 'Workers - Medium Wage'
    },
    {
      'name': 'Workers - Low Wage',
      'id': 'Workers - Low Wage'
    },
    {
      'name': 'Jobs - Total',
      'id': 'Jobs - Total'
    },
    {
      'name': 'd1c8_pub10',
      'id': 'd1c8_pub10'
    },
    {
      'name': 'e_fedent10',
      'id': 'e_fedent10'
    },
    {
      'name': 'pct_ao2p',
      'id': 'pct_ao2p'
    },
    {
      'name': 'd1c5_ent10',
      'id': 'd1c5_ent10'
    },
    {
      'name': 'd5dri',
      'id': 'd5dri'
    },
    {
      'name': 'd1c8_off10',
      'id': 'd1c8_off10'
    },
    {
      'name': 'e5_ind10',
      'id': 'e5_ind10'
    },
    {
      'name': 'd5be_flag',
      'id': 'd5be_flag'
    },
    {
      'name': 'Jobs - Industrial',
      'id': 'Jobs - Industrial'
    },
    {
      'name': 'd3aao',
      'id': 'd3aao'
    },
    {
      'name': 'd1c5_off10',
      'id': 'd1c5_off10'
    },
    {
      'name': 'd1c8_hlth1',
      'id': 'd1c8_hlth1'
    },
    {
      'name': 'd2b_e8mix',
      'id': 'd2b_e8mix'
    },
    {
      'name': 'cfips',
      'id': 'cfips'
    },
    {
      'name': 'shape_leng',
      'id': 'shape_leng'
    },
    {
      'name': 'd1c5_svc10',
      'id': 'd1c5_svc10'
    },
    {
      'name': 'd5br',
      'id': 'd5br'
    },
    {
      'name': 'd1c8_ind10',
      'id': 'd1c8_ind10'
    },
    {
      'name': 'Households - Zero Cars',
      'id': 'Households - Zero Cars'
    },
    {
      'name': 'autoown1',
      'id': 'autoown1'
    },
    {
      'name': 'Residents',
      'id': 'Residents'
    },
    {
      'name': 'pct_ao1',
      'id': 'pct_ao1'
    },
    {
      'name': 'pct_ao0',
      'id': 'pct_ao0'
    },
    {
      'name': 'Workers',
      'id': 'Workers'
    },
    {
      'name': 'd5ce',
      'id': 'd5ce'
    },
    {
      'name': 'd2b_e5mix',
      'id': 'd2b_e5mix'
    },
    {
      'name': 'd2c_trpmx2',
      'id': 'd2c_trpmx2'
    },
    {
      'name': 'd3bmm4',
      'id': 'd3bmm4'
    },
    {
      'name': 'd2c_trpmx1',
      'id': 'd2c_trpmx1'
    },
    {
      'name': 'd3bmm3',
      'id': 'd3bmm3'
    },
    {
      'name': 'cbsa_wrk',
      'id': 'cbsa_wrk'
    },
    {
      'name': 'Jobs - Service',
      'id': 'Jobs - Service'
    },
    {
      'name': 'csa_name',
      'id': 'csa_name'
    },
    {
      'name': 'd5ar',
      'id': 'd5ar'
    },
    {
      'name': 'Jobs - Entertainment',
      'id': 'Jobs - Entertainment'
    },
    {
      'name': 'd2a_jphh',
      'id': 'd2a_jphh'
    },
    {
      'name': 'ac_land',
      'id': 'ac_land'
    },
    {
      'name': 'Jobs - Retail',
      'id': 'Jobs - Retail'
    },
    {
      'name': 'd5cri',
      'id': 'd5cri'
    },
    {
      'name': 'e_pctlowwa',
      'id': 'e_pctlowwa'
    },
    {
      'name': 'd5be',
      'id': 'd5be'
    },
    {
      'name': 'sfips',
      'id': 'sfips'
    },
    {
      'name': 'cbsa_emp',
      'id': 'cbsa_emp'
    },
    {
      'name': 'Jobs - Education',
      'id': 'Jobs - Education'
    },
    {
      'name': 'ac_water',
      'id': 'ac_water'
    },
    {
      'name': 'd3amm',
      'id': 'd3amm'
    },
    {
      'name': 'd5dei',
      'id': 'd5dei'
    },
    {
      'name': 'd1c8_ret10',
      'id': 'd1c8_ret10'
    },
    {
      'name': 'd4b025',
      'id': 'd4b025'
    },
    {
      'name': 'cbsa_name',
      'id': 'cbsa_name'
    },
    {
      'name': 'ac_tot',
      'id': 'ac_tot'
    },
    {
      'name': 'd1c5_ret10',
      'id': 'd1c5_ret10'
    },
    {
      'name': 'd2a_wrkemp',
      'id': 'd2a_wrkemp'
    },
    {
      'name': 'Jobs - Office',
      'id': 'Jobs - Office'
    },
    {
      'name': 'Jobs - Public Service',
      'id': 'Jobs - Public Service'
    },
    {
      'name': 'd1c8_svc10',
      'id': 'd1c8_svc10'
    },
    {
      'name': 'd1c5_ind10',
      'id': 'd1c5_ind10'
    },
    {
      'name': 'd2a_ephhm',
      'id': 'd2a_ephhm'
    },
    {
      'name': 'bost5_accc',
      'id': 'bost5_accc'
    },
    {
      'name': 'e_fedsvc10',
      'id': 'e_fedsvc10'
    },
    {
      'name': 'd5cr',
      'id': 'd5cr'
    },
    {
      'name': 'd5dr',
      'id': 'd5dr'
    },
    {
      'name': 'Jobs - Healthcare',
      'id': 'Jobs - Healthcare'
    },
    {
      'name': 'e_fedret10',
      'id': 'e_fedret10'
    },
    {
      'name': 'r_pctlowwa',
      'id': 'r_pctlowwa'
    },
    {
      'name': 'd1b',
      'id': 'd1b'
    },
    {
      'name': 'd1a',
      'id': 'd1a'
    },
    {
      'name': 'd1d',
      'id': 'd1d'
    },
    {
      'name': 'd1c',
      'id': 'd1c'
    },
    {
      'name': 'd5de',
      'id': 'd5de'
    },
    {
      'name': 'd2r_jobpop',
      'id': 'd2r_jobpop'
    },
    {
      'name': 'p_wrkage',
      'id': 'p_wrkage'
    },
    {
      'name': 'cbsa',
      'id': 'cbsa'
    },
    {
      'name': 'd2c_wremix',
      'id': 'd2c_wremix'
    },
    {
      'name': 'ac_unpr',
      'id': 'ac_unpr'
    },
    {
      'name': 'd2c_tripeq',
      'id': 'd2c_tripeq'
    },
    {
      'name': 'd5cei',
      'id': 'd5cei'
    },
    {
      'name': 'bost5_accs',
      'id': 'bost5_accs'
    },
    {
      'name': 'd4b050',
      'id': 'd4b050'
    },
    {
      'name': 'bost5_accm',
      'id': 'bost5_accm'
    },
    {
      'name': 'e5_svc10',
      'id': 'e5_svc10'
    },
    {
      'name': 'e5_ent10',
      'id': 'e5_ent10'
    },
    {
      'name': 'autoown2p',
      'id': 'autoown2p'
    },
    {
      'name': 'd2r_wrkemp',
      'id': 'd2r_wrkemp'
    },
    {
      'name': 'e_fedoff10',
      'id': 'e_fedoff10'
    },
    {
      'name': 'counthu10',
      'id': 'counthu10'
    },
    {
      'name': 'd3bpo3',
      'id': 'd3bpo3'
    },
    {
      'name': 'e5_ret10',
      'id': 'e5_ret10'
    },
    {
      'name': 'd3bpo4',
      'id': 'd3bpo4'
    },
    {
      'name': 'd5br_flag',
      'id': 'd5br_flag'
    },
    {
      'name': 'd2b_e5mixa',
      'id': 'd2b_e5mixa'
    },
    {
      'name': 'd3apo',
      'id': 'd3apo'
    },
    {
      'name': 'Jobs - Low Wage',
      'id': 'Jobs - Low Wage'
    },
    {
      'name': 'd1_flag',
      'id': 'd1_flag'
    },
    {
      'name': 'trfips',
      'id': 'trfips'
    },
    {
      'name': 'Jobs - Medium Wage',
      'id': 'Jobs - Medium Wage'
    },
    {
      'name': 'csa',
      'id': 'csa'
    },
    {
      'name': 'Workers - High Wage',
      'id': 'Workers - High Wage'
    },
    {
      'name': 'd3b',
      'id': 'd3b'
    },
    {
      'name': 'd3a',
      'id': 'd3a'
    },
    {
      'name': 'shape_area',
      'id': 'shape_area'
    },
    {
      'name': 'e_fedind10',
      'id': 'e_fedind10'
    },
    {
      'name': 'd3bao',
      'id': 'd3bao'
    }
  ]
}

const destinationsReducers = handleActions({
  UPDATE_SELECTED_DESTINATIONS: (state, action) => {
    return Object.assign({}, state, { selected: action.payload })
  }
}, initialDestinationsState)

export default destinationsReducers
