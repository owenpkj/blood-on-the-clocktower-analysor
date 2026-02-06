import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { roles } from '@/data/roles'
import { scripts } from '@/data/scripts'

// 使用服务端密钥进行数据库写入（需要在环境变量中配置）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  try {
    // 创建具有服务端权限的客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. 插入角色数据
    const rolesData = roles.map(role => ({
      id: role.id,
      name_zh: role.name_zh,
      name_en: role.name_en,
      type: role.type,
      ability: role.ability,
      affects_setup: role.affects_setup,
      setup_modification: role.setup_modification
    }))

    const { error: rolesError } = await supabase
      .from('roles')
      .upsert(rolesData, { onConflict: 'id' })

    if (rolesError) {
      console.error('Error inserting roles:', rolesError)
      return NextResponse.json({
        success: false,
        error: `Failed to insert roles: ${rolesError.message}`
      }, { status: 500 })
    }

    // 2. 插入剧本数据
    const scriptsData = scripts.map(script => ({
      id: script.id,
      name_zh: script.name_zh,
      name_en: script.name_en,
      description: script.description,
      difficulty: script.difficulty,
      min_players: script.min_players,
      max_players: script.max_players,
      role_ids: script.role_ids,
      first_night_order: script.first_night_order,
      other_night_order: script.other_night_order,
      player_counts: script.player_counts,
      special_rules: script.special_rules
    }))

    const { error: scriptsError } = await supabase
      .from('scripts')
      .upsert(scriptsData, { onConflict: 'id' })

    if (scriptsError) {
      console.error('Error inserting scripts:', scriptsError)
      return NextResponse.json({
        success: false,
        error: `Failed to insert scripts: ${scriptsError.message}`
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${rolesData.length} roles and ${scriptsData.length} scripts`
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET 请求用于检查数据状态
export async function GET() {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const [rolesResult, scriptsResult] = await Promise.all([
      supabase.from('roles').select('id', { count: 'exact' }),
      supabase.from('scripts').select('id', { count: 'exact' })
    ])

    return NextResponse.json({
      roles_count: rolesResult.count || 0,
      scripts_count: scriptsResult.count || 0,
      roles_error: rolesResult.error?.message,
      scripts_error: scriptsResult.error?.message
    })

  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
