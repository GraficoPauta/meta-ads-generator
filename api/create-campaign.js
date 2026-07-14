export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { account, campaignData, adsetData, adsData } = req.body;
    const META_TOKEN = process.env.META_ACCESS_TOKEN;

    if (!META_TOKEN) {
        return res.status(500).json({ error: 'META_ACCESS_TOKEN no configurada' });
    }

    try {
        console.log('Creando campaña en Meta...', campaignData.name);

        // 1. CREAR CAMPAÑA
        const campaignRes = await fetch(
            `https://graph.facebook.com/v18.0/${account}/campaigns`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: campaignData.name,
                    objective: 'OUTCOME_SALES',
                    status: 'PAUSED',
                    special_ad_categories: ['NONE'],
                    access_token: META_TOKEN
                })
            }
        );

        if (!campaignRes.ok) {
            const error = await campaignRes.json();
            console.error('Error creating campaign:', error);
            return res.status(500).json({ error: 'Error creating campaign: ' + JSON.stringify(error) });
        }

        const campaign = await campaignRes.json();
        const campaignId = campaign.id;
        console.log('Campaign created:', campaignId);

        // 2. CREAR AD SET
        const adsetRes = await fetch(
            `https://graph.facebook.com/v18.0/${campaignId}/adsets`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: adsetData.name,
                    optimization_goal: 'CONVERSIONS',
                    billing_event: 'IMPRESSIONS',
                    status: 'PAUSED',
                    daily_budget: adsetData.budget * 100, // Meta usa centavos
                    targeting: {
                        geo_locations: { regions: [{ key: 'CO' }] },
                        age_min: adsetData.ageMin,
                        age_max: adsetData.ageMax,
                        facebook_positions: ['feed'],
                        instagram_positions: ['feed']
                    },
                    access_token: META_TOKEN
                })
            }
        );

        if (!adsetRes.ok) {
            const error = await adsetRes.json();
            console.error('Error creating adset:', error);
            return res.status(500).json({ error: 'Error creating adset: ' + JSON.stringify(error) });
        }

        const adset = await adsetRes.json();
        const adsetId = adset.id;
        console.log('Adset created:', adsetId);

        // 3. CREAR 4 ADS
        const adIds = [];

        for (let i = 0; i < adsData.length; i++) {
            const adData = adsData[i];

            const adRes = await fetch(
                `https://graph.facebook.com/v18.0/${adsetId}/ads`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: `Ad ${i + 1} - ${adData.headline.substring(0, 30)}`,
                        adset_id: adsetId,
                        status: 'PAUSED',
                        creative: {
                            title: adData.headline,
                            body: adData.description,
                            call_to_action_type: 'SHOP_NOW'
                        },
                        access_token: META_TOKEN
                    })
                }
            );

            if (!adRes.ok) {
                const error = await adRes.json();
                console.error(`Error creating ad ${i + 1}:`, error);
                return res.status(500).json({ error: `Error creating ad ${i + 1}: ` + JSON.stringify(error) });
            }

            const ad = await adRes.json();
            adIds.push(ad.id);
            console.log(`Ad ${i + 1} created:`, ad.id);
        }

        res.status(200).json({
            success: true,
            campaign: { id: campaignId, name: campaignData.name },
            adset: { id: adsetId, name: adsetData.name },
            ads: adIds.map((id, idx) => ({ id, number: idx + 1 }))
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error: ' + error.message });
    }
};
