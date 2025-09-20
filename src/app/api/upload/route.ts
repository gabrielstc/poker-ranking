import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // Reduzir para 2MB temporariamente
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

// Configurar limite do body
export const maxDuration = 30 // 30 segundos timeout

export async function POST(request: NextRequest) {
  console.log('=== INÍCIO DO UPLOAD ===')
  try {
    // Verificar se o request tem o content-type correto
    const contentType = request.headers.get('content-type')
    console.log('Content-Type:', contentType)
    
    console.log('Upload iniciado')
    const session = await getServerSession(authOptions)
    
    if (!session) {
      console.log('Sessão não encontrada')
      return NextResponse.json(
        { error: 'Não autorizado' }, 
        { status: 401 }
      )
    }

    console.log('Usuário autenticado:', session.user.email, 'Role:', session.user.role)

    // Verificar se o usuário tem permissão (SUPER_ADMIN ou CLUB_ADMIN)
    if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'CLUB_ADMIN') {
      console.log('Acesso negado para role:', session.user.role)
      return NextResponse.json(
        { error: 'Acesso negado' }, 
        { status: 403 }
      )
    }

    console.log('Obtendo formData...')
    const formData = await request.formData()
    console.log('FormData keys:', Array.from(formData.keys()))
    
    const file = formData.get('file') as File

    if (!file) {
      console.log('Nenhum arquivo encontrado no formData')
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' }, 
        { status: 400 }
      )
    }

    console.log('Arquivo recebido:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // Verificar tipo do arquivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log('Tipo de arquivo não permitido:', file.type)
      return NextResponse.json(
        { error: 'Tipo de arquivo não permitido. Use PNG, JPG, JPEG ou WebP' }, 
        { status: 400 }
      )
    }

    // Verificar tamanho do arquivo
    if (file.size > MAX_FILE_SIZE) {
      console.log('Arquivo muito grande:', file.size)
      return NextResponse.json(
        { error: 'Arquivo muito grande. Máximo 5MB' }, 
        { status: 400 }
      )
    }

    console.log('Convertendo para base64...')
    // Converter para base64
    const bytes = await file.arrayBuffer()
    console.log('Bytes obtidos:', bytes.byteLength)
    
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    console.log('Base64 gerado, tamanho:', base64.length)
    console.log('DataUrl prefix:', dataUrl.substring(0, 50))

    const response = {
      success: true,
      dataUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    }

    console.log('Upload concluído com sucesso')
    console.log('=== FIM DO UPLOAD ===')
    
    return NextResponse.json(response)

  } catch (error) {
    console.error('=== ERRO NO UPLOAD ===')
    console.error('Erro detalhado:', error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    console.error('=== FIM DO ERRO ===')
    
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error instanceof Error ? error.message : 'Erro desconhecido' }, 
      { status: 500 }
    )
  }
}