// Migration kontrol scripti
// Railway'de veya local'de çalıştırarak migration durumunu kontrol edebilirsiniz

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkMigration() {
  try {
    console.log('🔍 Migration durumu kontrol ediliyor...\n');

    // Users tablosunun yapısını kontrol et
    const result = await prisma.$queryRaw`
      SELECT 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('google_id', 'provider', 'password')
      ORDER BY column_name;
    `;

    console.log('📊 Users tablosu kolonları:');
    console.table(result);

    // Index kontrolü
    const indexResult = await prisma.$queryRaw`
      SELECT 
        indexname, 
        indexdef
      FROM pg_indexes 
      WHERE tablename = 'users' 
      AND indexname = 'users_google_id_key';
    `;

    console.log('\n📑 Index durumu:');
    if (indexResult.length > 0) {
      console.log('✅ google_id unique index mevcut');
      console.table(indexResult);
    } else {
      console.log('❌ google_id unique index bulunamadı');
    }

    // Google ile kayıtlı kullanıcı sayısı
    const googleUserCount = await prisma.user.count({
      where: {
        provider: 'google'
      }
    });

    console.log(`\n👥 Google ile kayıtlı kullanıcı sayısı: ${googleUserCount}`);

    // Migration durumu özeti
    const hasGoogleId = result.some(r => r.column_name === 'google_id');
    const hasProvider = result.some(r => r.column_name === 'provider');
    const passwordNullable = result.find(r => r.column_name === 'password')?.is_nullable === 'YES';
    const hasIndex = indexResult.length > 0;

    console.log('\n📋 Migration Durumu Özeti:');
    console.log(`  google_id kolonu: ${hasGoogleId ? '✅' : '❌'}`);
    console.log(`  provider kolonu: ${hasProvider ? '✅' : '❌'}`);
    console.log(`  password nullable: ${passwordNullable ? '✅' : '❌'}`);
    console.log(`  google_id index: ${hasIndex ? '✅' : '❌'}`);

    if (hasGoogleId && hasProvider && passwordNullable && hasIndex) {
      console.log('\n✅ Migration başarıyla uygulanmış!');
      process.exit(0);
    } else {
      console.log('\n❌ Migration eksik veya hatalı. Lütfen migration\'ı çalıştırın.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkMigration();


